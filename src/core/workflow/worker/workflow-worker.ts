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

export interface WorkflowWorker<T> {
  register(): Observable<void>;

  startWorker(): void;
}

export class BaseWorkflowWorker<T> implements WorkflowWorker<T> {

  private pollSubscription: Subscription;

  constructor(private workflowClient: WorkflowClient,
              private appContainer: Container,
              private contextCache: ContextCache,
              private poller: TaskPollerObservable<DecisionTask>,
              private domain: string,
              private binding: Binding) {
  }

  private workflowDefinitionToRegisterWorkflowTypeInput(definition: WorkflowDefinition): RegisterWorkflowTypeInput {
    const result = {
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
    return result;
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

  register(): Observable<any> {
    const definitions = getDefinitionsFromClass<WorkflowDefinition>(this.binding.impl);
    return Observable.from(definitions)
      .flatMap((def: WorkflowDefinition) => this.registerWorkflow(def))
      .toArray();
  }

  startWorker(): void {
    this.pollSubscription = this.poller.subscribe(
      (decisionTask: DecisionTask) => {
        console.log(decisionTask);
        const context = this.contextCache
          .getOrCreateContext(decisionTask.workflowExecution.runId);
        const workflowExecution = context.getWorkflowExecution();

        if (workflowExecution.currentState === WorkflowExecutionStates.Created) {
          workflowExecution
            .onChange
            .filter(state => state === WorkflowExecutionStates.Started);
        }

        context.processEventList(decisionTask);
        //executions[0].onChange.subscribe(state => console.log(state));

        //context.getStateMachines()

      },
      (error) => {
        console.error(error);
      });
  }

}
