import { WorkflowDefinition } from './workflow-definition';
import { getPropertyLevelDefinitionsFromClass } from '../utils/decorators/utils';
import { Newable } from '../../implementation';
import { DecisionRunContext } from '../context/decision-run-context';

export class RemoteWorkflowStub<T> {

  [key: string]: any;

  constructor(private workflowDefinition: WorkflowDefinition[]) {
    workflowDefinition.forEach((definition: WorkflowDefinition) => {
      this[definition.decoratedMethodName] = definition;
    });
  }
}

