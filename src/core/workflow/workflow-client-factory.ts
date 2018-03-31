import { Newable } from '../../implementation';
import { WorkflowDefinition } from './workflow-definition';
import { getDefinitionsFromClass } from '../utils/decorators/utils';
import { RemoteWorkflowStub } from './workflow-proxy';
import { injectable } from 'inversify';


export const WORKFLOW_REMOTE_CLIENT_FACTORY = Symbol('WORKFLOW_REMOTE_CLIENT_FACTORY');
export const WORKFLOW_LOCAL_CLIENT_FACTORY = Symbol('WORKFLOW_LOCAL_CLIENT_FACTORY');

export interface WorkflowClientFactory {
  create<T>(implementation: Newable<T>): RemoteWorkflowStub<T> ;
}

@injectable()
export class BaseRemoteWorkflowClientFactory {

  create<T>(implementation: Newable<T>): RemoteWorkflowStub<T> {
    const workflowDefinition: WorkflowDefinition[] = getDefinitionsFromClass<WorkflowDefinition>(implementation);
    return new RemoteWorkflowStub<T>(workflowDefinition);
  }
}
