import {ActivityDefinition} from "../activity-definition";
import {ActivityDefinitionProperty} from "../activity-deinition-property";
import {ValueSetterDecoratorFactory, definitionPropertySetterFactory} from "../../decorators/utils";


export function activityDefinitionDecoratorFactory<T>(activityDefinitionProperty: ActivityDefinitionProperty): ValueSetterDecoratorFactory<T> {
    return definitionPropertySetterFactory<T, ActivityDefinition>(ActivityDefinitionProperty[activityDefinitionProperty], ActivityDefinition);
}