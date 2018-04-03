import { WorkflowDefinition } from './workflow-definition';

export class RemoteWorkflowStub<T> {

  [key: string]: any;

  constructor(private workflowDefinition: WorkflowDefinition[]) {
    workflowDefinition.forEach((definition: WorkflowDefinition) => {
      this[definition.decoratedMethodName] = definition;
    });
  }
}

