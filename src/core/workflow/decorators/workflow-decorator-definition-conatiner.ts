import { AbstractDefinitionContainer } from '../../utils/decorators/definition-container';
import { WorkflowDefinition } from '../workflow-definition';
export class WorkflowDecoratorDefinitionContainer extends AbstractDefinitionContainer<WorkflowDefinition> {
  protected createDefinition(decoratedPropertyName: string): WorkflowDefinition {
    return new WorkflowDefinition(decoratedPropertyName);
  }
}
