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
import { DecisionRunContext } from '../../context/decision-run-context';
import { Decision, DecisionList, RespondDecisionTaskCompletedInput, WorkflowType } from 'aws-sdk/clients/swf';
import { ActivityDecisionStateMachine, BaseActivityDecisionStateMachine } from '../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { ActivityDecisionState } from '../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states';
import 'zone.js/dist/zone-patch-rxjs';
import { LocalMultiBindingStub, LocalStub } from '../../utils/local-stub';
import { Logger } from '../../logging/logger';
import { filter, mergeMap, tap, catchError } from 'rxjs/operators';
import { pipe } from 'rxjs/Rx';
import { empty } from 'rxjs/observable/empty';
import { from } from 'rxjs/observable/from';
import { timer } from 'rxjs/observable/timer';


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


  public register(): Observable<any> {
    return from(this.bindings)
      .mergeMap(b => getPropertyLevelDefinitionsFromClass<WorkflowDefinition>(b.impl))
      .mergeMap((def: WorkflowDefinition) => this.registerWorkflow(def), 1)
      .toArray();
  }

  public startWorker(): void {
    this.wfStub = this.createWorkflowStub();
    const sharedPoller = this.poller.share();


    this.pollSubscription = sharedPoller
      .let(pipe(
        this.workflowStateFilter(WorkflowExecutionStates.Created),
        this.createWorkflowEventsHandler())).subscribe();
    const processSub = sharedPoller.let(this.createProcessEventsPipe()).subscribe();
    this.pollSubscription.add(processSub);
  }


  private createWorkflowEventsHandler() {
    return mergeMap((decisionTask: DecisionTask) => {
      const runId = decisionTask.workflowExecution.runId;
      const context = this.contextCache.getOrCreateContext(runId);
      const execution = context.getWorkflowExecution();
      const callWorkflowExecutionInZone = mergeMap(() => context.getZone()
        .runGuarded(() => this.wfStub.callMethodWithInput(execution.workflowType, execution.input)));
      const logExecution = this.loggerForWorkflowType(decisionTask.workflowType);
      const respondCompleted = mergeMap((workflowResult: string) => this.respondCompletedWorkflowDecision(workflowResult, context));
      const respondFailed = catchError(workflowError => this.respondFailedWorkflowDecision(workflowError.details, workflowError.message, context));
      const workflowStartedFilter = filter(state => state === WorkflowExecutionStates.Started);

      return execution.onChange.pipe(
        workflowStartedFilter,
        callWorkflowExecutionInZone,
        logExecution,
        respondCompleted,
        respondFailed,
      );
    });
  }

  private loggerForWorkflowType(workflowType: WorkflowType) {
    return tap(
      result => this.logger.debug('Workflow %s:%s finished: %s', workflowType.name, workflowType.version, result),
      err => this.logger.debug('Workflow %s:%s failed: %s %s', workflowType.name, workflowType.version, err.message, err.details),
    );
  }

  private workflowStateFilter(state: WorkflowExecutionStates) {
    return filter((decisionTask: DecisionTask) => {
      const runId = decisionTask.workflowExecution.runId;
      const context = this.contextCache.getOrCreateContext(runId);
      const execution = context.getWorkflowExecution();
      return execution.currentState === state;
    });
  }

  private createProcessEventsPipe() {
    return mergeMap((decisionTask: DecisionTask) => {
      const runId = decisionTask.workflowExecution.runId;
      const taskToken = decisionTask.taskToken;
      const context = this.contextCache.getOrCreateContext(runId);
      this.logger.profile('Process event list');
      context.processEventList(decisionTask);
      this.logger.profile('Process event list');
      return timer(10).mergeMap(() => this.respondActivityDecisions(taskToken, context));
    });
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

  private registerWorkflow(definition: WorkflowDefinition): Observable<any> {
    const registerWorkflowInput = this.workflowDefinitionToRegisterWorkflowTypeInput(definition);
    return this.workflowClient
      .registerWorkflowType(registerWorkflowInput)
      .catch((error: AWSError) => {
        if (error.code === 'TypeAlreadyExistsFault') {
          return empty();
        }
        return Observable.throw(error);
      });
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
      return empty();
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
      return empty();
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
    return empty();
  }

  private createWorkflowStub(): LocalStub {
    return new LocalMultiBindingStub(this.appContainer, this.bindings, this.logger);
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

}
