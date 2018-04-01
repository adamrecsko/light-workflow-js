import { ValueSetterDecoratorFactory, propertyLevelDefinition, Decorator } from '../../utils/decorators/utils';
import { WorkflowDecoratorDefinitionContainer } from './workflow-decorator-definition-conatiner';
import { WorkflowDefinition } from '../workflow-definition';

export function workflowDecoratorFactory<T>(property: keyof WorkflowDefinition): ValueSetterDecoratorFactory<T, Decorator> {
  return propertyLevelDefinition<T, WorkflowDefinition>(property, WorkflowDecoratorDefinitionContainer);
}
