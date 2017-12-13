import { ActivityDefinition, ActivityDefinitionProperty } from '../activity-definition';
import { ValueSetterDecoratorFactory, definitionPropertySetterFactory } from '../../decorators/utils';
import { ActivityDecoratorDefinitionContainer } from './activity-decorator-definition-container';


export function activityDefinitionDecoratorFactory<T>(activityDefinitionProperty: ActivityDefinitionProperty): ValueSetterDecoratorFactory<T> {
  return definitionPropertySetterFactory<T, ActivityDefinition>(ActivityDefinitionProperty[activityDefinitionProperty], ActivityDecoratorDefinitionContainer);
}
