import { ActivityDefinition } from '../activity-definition';
import { ValueSetterDecoratorFactory, propertyLevelDefinition, Decorator } from '../../../utils/decorators/utils';
import { ActivityDecoratorDefinitionContainer } from './activity-decorator-definition-container';


export function activityDefinitionDecoratorFactory<T>(property: keyof ActivityDefinition): ValueSetterDecoratorFactory<T, Decorator> {
  return propertyLevelDefinition<T, ActivityDefinition>(property, ActivityDecoratorDefinitionContainer);
}
