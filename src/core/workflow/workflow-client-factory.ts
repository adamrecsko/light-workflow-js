import { Newable } from '../../implementation';
import { WorkflowDefinition } from './workflow-definition';
import { getDefinitionsFromClass } from '../decorators/utils';
import { WorkflowProxy } from './workflow-proxy';
import { injectable } from 'inversify';


export const WORKFLOW_CLIENT_FACTORY = Symbol('WORKFLOW_CLIENT_FACTORY');

export interface WorkflowClientFactory {
  create<T>(implementation: Newable<T>): WorkflowProxy;
}

@injectable()
export class BaseWorkflowClientFactory {

  create<T>(implementation: Newable<T>): WorkflowProxy {
    const workflowDefinition: WorkflowDefinition[] = getDefinitionsFromClass<WorkflowDefinition>(implementation);

    const workflowProxy = new WorkflowProxy();

    workflowDefinition.forEach((definition: WorkflowDefinition) => {
      workflowProxy[definition.decoratedMethodName] = definition;
    });
    return workflowProxy;
  }
}
