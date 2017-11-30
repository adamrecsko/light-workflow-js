import {WorkflowResult} from "./workflow-result";
import {WorkflowDefinition} from "./workflow-definition";
import {inject, injectable} from "inversify";
import {WorkflowClient} from "../../aws/workflow-client";
import {WORKFLOW_CLIENT} from "../../symbols";
import {WorkflowStartParameters} from "../../aws/aws.types";
import {UUID_GENERATOR, UuidGenerator} from "../utils/uuid-generator";


export interface WorkflowFn {
  <A, B, C, D, E, R> (wf: (param1: A, param2: B, param3: C, param4: D, param5: E) => Promise<R>, param1: A, param2: B, param3: C, param4: D, param5: E): Promise<WorkflowResult<R>>;
  <A, B, C, D, R> (wf: (param1: A, param2: B, param3: C, param4: D) => Promise<R>, param1: A, param2: B, param3: C, param4: D): Promise<WorkflowResult<R>>;
  <A, B, C, R> (wf: (param1: A, param2: B, param3: C) => Promise<R>, param1: A, param2: B, param3: C): Promise<WorkflowResult<R>>;
  <A, B, R> (wf: (param1: A, param2: B) => Promise<R>, param1: A, param2: B): Promise<WorkflowResult<R>>;
  <A, R> (wf: (param1: A) => Promise<R>, param1: A): Promise<WorkflowResult<R>>;
  <R> (wf: () => Promise<R>): Promise<WorkflowResult<R>>;
}


export const WORKFLOWS = Symbol('WORKFLOWS');

export interface Workflows {
  start: WorkflowFn;
}

@injectable()
export class BaseWorkflows implements Workflows {
  constructor(@inject(WORKFLOW_CLIENT)
              private workflowClient: WorkflowClient,
              @inject(UUID_GENERATOR)
              private uuidGenerator: UuidGenerator) {
  }


  private generateNewWorkflowId(): string {
    return this.uuidGenerator.generate();
  }

  async start(...args: any[]): Promise<any> {
    const definition = args[0] as WorkflowDefinition;
    const startParams = args.slice(1);
    const input = definition.serializer.stringify(startParams);

    const workflowStartParameters: WorkflowStartParameters = {
      domain: definition.domain,
      workflowId: this.generateNewWorkflowId(),
      workflowType: {
        name: definition.name,
        version: definition.version
      },

      taskList: definition.taskList,
      taskPriority: definition.taskPriority,
      input: input,
      executionStartToCloseTimeout: definition.executionStartToCloseTimeout,
      tagList: definition.tagList,
      taskStartToCloseTimeout: definition.taskStartToCloseTimeout,
      childPolicy: definition.childPolicy,
      lambdaRole: definition.lambdaRole,
    };


    const result = await this.workflowClient.startWorkflow(workflowStartParameters).toPromise();

    return {
      runId: result.runId
    };
  }
}