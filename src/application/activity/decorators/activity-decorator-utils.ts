import {ActivityDefinition} from "../activity-definition";
import {ActivityDefinitionProperty} from "../activity-deinition-property";
import {ActivityDefinitionsContainer} from "./activity-decorator-container";
import {Class} from "../../../implementation";

export const ACTIVITY_DEFINITIONS = Symbol('ACTIVITY_DEFINITIONS');

export type Decorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor)=>void;

export class DefinitionNotAvailableException extends Error {
    constructor(clazz: Class<any>) {
        super(`Activity definition not found on class: ${clazz}.`);
    }
}


export function activityDefinitionPropertySetterDecoratorFactory<T>(activityDefinitionProperty: ActivityDefinitionProperty): (value: T)=>Function {
    return function (value: T): Decorator {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
            const definitionContainer: ActivityDefinitionsContainer = target[ACTIVITY_DEFINITIONS] = target[ACTIVITY_DEFINITIONS] || new ActivityDefinitionsContainer();
            let activityDefinition: ActivityDefinition;
            if (definitionContainer.hasDefinition(propertyKey)) {
                activityDefinition = definitionContainer.getDefinitionToProperty(propertyKey);
            } else {
                activityDefinition = new ActivityDefinition(propertyKey);
                definitionContainer.addDefinition(activityDefinition);
            }
            activityDefinition[ActivityDefinitionProperty[activityDefinitionProperty]] = value;
        }
    }
}


export function getActivityDefinitionsFromClass(clazz: Class<any>): ActivityDefinition[] {
    const defContainer: ActivityDefinitionsContainer = (<ActivityDefinitionsContainer>clazz.prototype[ACTIVITY_DEFINITIONS]);
    if (defContainer) {
        return defContainer.toArray();
    } else {
        throw new DefinitionNotAvailableException(clazz);
    }
}