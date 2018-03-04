import { Observable } from 'rxjs/Observable';
import { WorkflowClient } from '../../../aws/workflow-client';
import { Binding } from '../../generics/implementation-helper';
import { getDefinitionsFromClass } from '../../utils/decorators/utils';
import { WorkflowDefinition } from '../workflow-definition';
import { DecisionTask, RegisterWorkflowTypeInput } from '../../../aws/aws.types';
import { AWSError } from 'aws-sdk';
import { Container } from 'inversify';
import { TaskPollerObservable } from '../../../aws/swf/task-poller-observable';
import { Subscription } from 'rxjs/Subscription';
import { ContextCache } from '../../context/context-cache';
import { WorkflowExecution } from '../../context/state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution';
import { WorkflowExecutionStates } from '../../context/state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution-states';
import { of } from 'rxjs/observable/of';
import { LocalWorkflowStub } from '../workflow-proxy';
import { DECISION_RUN_CONTEXT_ZONE_KEY } from '../../../constants';
import { tryCatch } from 'rxjs/util/tryCatch';
import { DecisionRunContext } from '../../context/decision-run-context';
import { Decision, DecisionList, RespondDecisionTaskCompletedInput } from 'aws-sdk/clients/swf';

export interface WorkflowWorker<T> {
  register(): Observable<void>;

  startWorker(): void;
}

export class BaseWorkflowWorker<T> implements WorkflowWorker<T> {

  private pollSubscription: Subscription;
  private wfStub: LocalWorkflowStub<T>;

  constructor(private workflowClient: WorkflowClient,
              private appContainer: Container,
              private contextCache: ContextCache,
              private poller: TaskPollerObservable<DecisionTask>,
              private domain: string,
              private binding: Binding) {
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

  private createRespondDecisionTaskCompletedInput(taskToken: string, decisions: DecisionList): RespondDecisionTaskCompletedInput {
    return {
      taskToken,
      decisions,
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
    const runId = decisionTask.workflowExecution.runId;
    const props = {
      [DECISION_RUN_CONTEXT_ZONE_KEY]: context,
    };
    Zone.current.fork({
      name: runId,
      properties: props,
    }).runGuarded(() => {
      context.processEventList(decisionTask);
    });
  }

  private async respondCompletedWorkflowDecision(taskToken: string, result: string, context: DecisionRunContext) {
    console.log(taskToken, result);
    const decision: Decision = {
      decisionType: 'CompleteWorkflowExecution',
      completeWorkflowExecutionDecisionAttributes: {
        result,
      },
    };
    const input = this.createRespondDecisionTaskCompletedInput(taskToken, [decision]);
    const workflowExecution = context.getWorkflowExecution();
    workflowExecution.setCompleteStateRequestedWith(result);
    return this.workflowClient.respondDecisionTaskCompleted(input).toPromise();
  }

  private async respondFailedWorkflowDecision(taskToken: string, details: string = 'error', reason: string, context: DecisionRunContext) {
    const decision: Decision = {
      decisionType: 'FailWorkflowExecution',
      failWorkflowExecutionDecisionAttributes: {
        details,
        reason,
      },
    };
    const input = this.createRespondDecisionTaskCompletedInput(taskToken, [decision]);
    const workflowExecution = context.getWorkflowExecution();
    workflowExecution.setExecutionFailedStateRequestedWith(details, reason);
    return this.workflowClient.respondDecisionTaskCompleted(input).toPromise();
  }


  createWorkflowStub(): LocalWorkflowStub<T> {
    const instance = this.appContainer.get<T>(this.binding.key);
    return new LocalWorkflowStub(this.binding.impl, instance);
  }

  register(): Observable<any> {
    const definitions = getDefinitionsFromClass<WorkflowDefinition>(this.binding.impl);
    return Observable.from(definitions)
      .flatMap((def: WorkflowDefinition) => this.registerWorkflow(def))
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
              .flatMap(() => {
                return this.wfStub.callWorkflowWithInput(workflowExecution.workflowType, workflowExecution.input)
                  .then(workflowResult => this.respondCompletedWorkflowDecision(decisionTask.taskToken, workflowResult, context),
                    err => this.respondFailedWorkflowDecision(decisionTask.taskToken, err.details, err.message, context));
              });
          });
      }).subscribe();

    const processSub = sharedPoller.subscribe((decisionTask: DecisionTask) => {
      const runId = decisionTask.workflowExecution.runId;
      const context = this.contextCache.getOrCreateContext(runId);
      this.processDecision(context, decisionTask);
    });
    this.pollSubscription.add(processSub);
  }

}
