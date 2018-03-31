import { WorkflowDefinitionProperties, WorkflowDefinition } from '../workflow-definition';
import { ValueSetterDecoratorFactory, definitionPropertySetterFactory } from '../../utils/decorators/utils';
import { WorkflowDecoratorDefinitionContainer } from './workflow-decorator-definition-conatiner';
export function workflowDecoratorFactory<T>(workflowDefinitionProperty: WorkflowDefinitionProperties): ValueSetterDecoratorFactory<T> {
  return definitionPropertySetterFactory<T, WorkflowDefinition>(WorkflowDefinitionProperties[workflowDefinitionProperty], WorkflowDecoratorDefinitionContainer);
}
