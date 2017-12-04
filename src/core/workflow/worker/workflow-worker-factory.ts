import {Binding} from "../../generics/implementation-helper";
import {BaseWorkflowWorker, WorkflowWorker} from "./workflow-worker";
import {inject, injectable} from "inversify";
import {WorkflowClient} from "../../../aws/workflow-client";
import {WORKFLOW_CLIENT} from "../../../symbols";

export const WORKFLOW_WORKER_FACTORY = Symbol('WORKFLOW_WORKER_FACTORY');


export interface WorkflowWorkerFactory {
  create<T>(domain: string, binding: Binding<T>): WorkflowWorker<T>;
}


@injectable()
export class BaseWorkflowWorkerFactory implements WorkflowWorkerFactory {
  constructor(@inject(WORKFLOW_CLIENT) private workflowClient: WorkflowClient) {

  }
  create<T>(domain: string, binding: Binding<T>): WorkflowWorker<T> {
    return new BaseWorkflowWorker(this.workflowClient, domain, binding);
  }
}