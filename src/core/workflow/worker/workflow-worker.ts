import {Observable} from "rxjs/Observable";
import {WorkflowClient} from "../../../aws/workflow-client";
import {Binding} from "../../generics/implementation-helper";
import {getDefinitionsFromClass} from "../../decorators/utils";
import {WorkflowDefinition} from "../workflow-definition";
import {RegisterWorkflowTypeInput} from "../../../aws/aws.types";
import {AWSError} from "aws-sdk";

export const WORKFLOW_WORKER = Symbol('WORKFLOW_WORKER');


export interface WorkflowWorker<T> {


  register(): Observable<void>;


}

export class BaseWorkflowWorker<T> implements WorkflowWorker<T> {

  constructor(private workflowClient: WorkflowClient,
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
      defaultLambdaRole: definition.defaultLambdaRole
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
        } else {
          return Observable.throw(error);
        }
      });
  }

  register(): Observable<any> {
    const definitions = getDefinitionsFromClass<WorkflowDefinition>(this.binding.impl);
    return Observable.from(definitions)
      .flatMap((def: WorkflowDefinition) => this.registerWorkflow(def))
      .toArray();
  }

}