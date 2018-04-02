import { Observable } from 'rxjs/Observable';
import { WorkflowClient } from '../../../aws/workflow-client';
import { Binding } from '../../generics/implementation-helper';
import { getPropertyLevelDefinitionsFromClass } from '../../utils/decorators/utils';
import { WorkflowDefinition } from '../workflow-definition';
import { DecisionTask, RegisterWorkflowTypeInput } from '../../../aws/aws.types';
import { AWSError } from 'aws-sdk';
import { Container } from 'inversify';
import { TaskPollerObservable } from '../../../aws/swf/task-poller-observable';
import { Subscription } from 'rxjs/Subscription';
import { ContextCache } from '../../context/context-cache';
import { WorkflowExecutionStates } from '../../context/state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution-states';
import { of } from 'rxjs/observable/of';
import { DecisionRunContext } from '../../context/decision-run-context';
import { Decision, DecisionList, RespondDecisionTaskCompletedInput } from 'aws-sdk/clients/swf';
import { ActivityDecisionStateMachine, BaseActivityDecisionStateMachine } from '../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { ActivityDecisionState } from '../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states';
import 'zone.js/dist/zone-patch-rxjs';
import { LocalMultiBindingStub, LocalStub, SingleInstanceLocalStub } from '../../utils/local-stub';
import { Logger } from '../../logging/logger';
import { ActivityDefinition } from '../../actor/activity/activity-definition';

export interface WorkflowWorker<T> {
  register(): Observable<void>;

  startWorker(): void;
}

export class BaseWorkflowWorker<T> implements WorkflowWorker<T> {

  private pollSubscription: Subscription;
  private wfStub: LocalStub;

  constructor(private workflowClient: WorkflowClient,
              private appContainer: Container,
              private contextCache: ContextCache,
              private poller: TaskPollerObservable<DecisionTask>,
              private domain: string,
              private bindings: Binding[],
              private logger: Logger) {
  }

  private workflowDefinitionToRegisterWorkflowTypeInput(definition: WorkflowDefinition): RegisterWorkflowTypeInput {
    return {
      domain: this.domain,
      name: definition.name,
      version: definition.version,
      description: definition.description,
      defaultTaskStartToCloseTimeout: definition.defaultTaskStartToCloseTimeout,
      defaultExecutionStartToCloseTimeout: definition.defaultExecutionStartToCloseTimeout,
      defaultTaskList: definition.defaultTaskList,
      defaultTaskPriority: definition.defaultTaskPriority,
      defaultChildPolicy: definition.defaultChildPolicy,
      defaultLambdaRole: definition.defaultLambdaRole,
    };
  }

  private static createCompletedInput(taskToken: string, decisions: DecisionList): RespondDecisionTaskCompletedInput {
    return {
      taskToken,
      decisions,
    };
  }

  private static createActivityScheduleDecisionFromStateMachine(sm: ActivityDecisionStateMachine): Decision {
    const params = sm.startParams;
    return {
      decisionType: 'ScheduleActivityTask',
      scheduleActivityTaskDecisionAttributes: {
        ...params,
      },
    };
  }

  private registerWorkflow(definition: WorkflowDefinition): Observable<any> {
    const registerWorkflowInput = this.workflowDefinitionToRegisterWorkflowTypeInput(definition);
    return this.workflowClient
      .registerWorkflowType(registerWorkflowInput)
      .catch((error: AWSError) => {
        if (error.code === 'TypeAlreadyExistsFault') {
          return Observable.empty();
        }
        return Observable.throw(error);
      });
  }

  private processDecision(context: DecisionRunContext, decisionTask: DecisionTask) {
    const taskToken = decisionTask.taskToken;
    this.logger.profile('Process event list');
    context.processEventList(decisionTask);
    this.logger.profile('Process event list');
    return Observable.timer(10).flatMap(() => this.respondActivityDecisions(taskToken, context));
  }

  private respondCompletedWorkflowDecision(result: string, context: DecisionRunContext) {
    const taskToken = context.currentTaskToken;
    const decision: Decision = {
      decisionType: 'CompleteWorkflowExecution',
      completeWorkflowExecutionDecisionAttributes: {
        result,
      },
    };
    const input = BaseWorkflowWorker.createCompletedInput(taskToken, [decision]);
    const workflowExecution = context.getWorkflowExecution();
    workflowExecution.setCompleteStateRequestedWith(result);
    return this.workflowClient.respondDecisionTaskCompleted(input).catch((err) => {
      this.logger.error(err);
      return of();
    });
  }

  private respondFailedWorkflowDecision(details: string = 'error', reason: string, context: DecisionRunContext) {
    const taskToken = context.currentTaskToken;
    const decision: Decision = {
      decisionType: 'FailWorkflowExecution',
      failWorkflowExecutionDecisionAttributes: {
        details,
        reason,
      },
    };
    const input = BaseWorkflowWorker.createCompletedInput(taskToken, [decision]);
    const workflowExecution = context.getWorkflowExecution();
    workflowExecution.setExecutionFailedStateRequestedWith(details, reason);
    return this.workflowClient.respondDecisionTaskCompleted(input).catch((err) => {
      this.logger.error(err);
      return of();
    });
  }


  private respondActivityDecisions(taskToken: string, context: DecisionRunContext) {
    const decisions: Decision[] = [];
    const stateMachines: any = context.getStateMachines();
    const machines: ActivityDecisionStateMachine[] = [];

    stateMachines.forEach((machine: any) => {
      if (machine instanceof BaseActivityDecisionStateMachine) {
        if (machine.currentState === ActivityDecisionState.Created) {
          machine.currentState = ActivityDecisionState.Sending;
          decisions.push(BaseWorkflowWorker.createActivityScheduleDecisionFromStateMachine(machine));
          machines.push(machine);
        }
      }
    });
    if (decisions.length > 0) {
      const input = BaseWorkflowWorker.createCompletedInput(taskToken, decisions);
      return this.workflowClient.respondDecisionTaskCompleted(input).do(() => {
        machines.forEach(machine => machine.currentState = ActivityDecisionState.Sent);
      });
    }
    return Observable.empty();
  }

  createWorkflowStub(): LocalStub {
    return new LocalMultiBindingStub(this.appContainer, this.bindings, this.logger);
  }

  register(): Observable<any> {
    return Observable.from(this.bindings)
      .mergeMap(b => getPropertyLevelDefinitionsFromClass<WorkflowDefinition>(b.impl))
      .flatMap((def: WorkflowDefinition) => this.registerWorkflow(def), 1)
      .toArray();
  }

  startWorker(): void {
    this.wfStub = this.createWorkflowStub();
    const sharedPoller = this.poller.share();
    this.pollSubscription = sharedPoller
      .flatMap((decisionTask: DecisionTask) => {
        const runId = decisionTask.workflowExecution.runId;
        const context = this.contextCache.getOrCreateContext(runId);
        return of(context.getWorkflowExecution())
          .filter(workflowExecution => workflowExecution.currentState === WorkflowExecutionStates.Created)
          .flatMap((workflowExecution) => {
            return workflowExecution
              .onChange
              .filter(state => state === WorkflowExecutionStates.Started)
              .flatMap(() => context.getZone().runGuarded(() => this.wfStub.callMethodWithInput(workflowExecution.workflowType, workflowExecution.input)))
              .do(
                result => this.logger.debug('Workflow %s:%s finished: %s', decisionTask.workflowType.name, decisionTask.workflowType.version, result),
                err => this.logger.debug('Workflow %s:%s failed: %s %s', decisionTask.workflowType.name, decisionTask.workflowType.version, err.message, err.details),
              )
              .flatMap((workflowResult: string) => this.respondCompletedWorkflowDecision(workflowResult, context))
              .catch(workflowError => this.respondFailedWorkflowDecision(workflowError.details, workflowError.message, context));
          });
      }).subscribe();

    const processSub = sharedPoller.flatMap((decisionTask: DecisionTask) => {
      const runId = decisionTask.workflowExecution.runId;
      const context = this.contextCache.getOrCreateContext(runId);
      return this.processDecision(context, decisionTask);
    }).subscribe();
    this.pollSubscription.add(processSub);
  }

}
