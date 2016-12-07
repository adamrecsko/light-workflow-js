import {ActivityDefinition} from "../activity-definition";
import {ActivityDefinitionProperty} from "../activity-deinition-property";
import {Newable} from "../../../implementation";
import {DefinitionContainer} from "../../definition-container";
import {BaseDefinition} from "../../definition";

export const DEFINITION_SYMBOL = Symbol('DEFINITION_SYMBOL');
export type Decorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor)=>void;
export type ValueSetterDecoratorFactory<T> = (value: T)=>Decorator;

export class DefinitionNotAvailableException extends Error {
    constructor(clazz: Newable<any>) {
        super(`Activity definition not found on class: ${clazz}.`);
    }
}


export function activityDefinitionDecoratorFactory<T>(activityDefinitionProperty: ActivityDefinitionProperty): ValueSetterDecoratorFactory<T> {
    return definitionPropertySetterFactory<T, ActivityDefinition>(ActivityDefinitionProperty[activityDefinitionProperty], ActivityDefinition);
}

function definitionPropertySetterFactory<T,D extends BaseDefinition>(definitionProperty: string, definitionClass: Newable<D>): ValueSetterDecoratorFactory<T> {
    return function (value: T): Decorator {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
            const definitionContainer: DefinitionContainer<D> = target[DEFINITION_SYMBOL] = target[DEFINITION_SYMBOL] || new DefinitionContainer<ActivityDefinition>();
            let definition: D;
            if (definitionContainer.hasDefinition(propertyKey)) {
                definition = definitionContainer.getDefinitionToProperty(propertyKey);
            } else {
                definition = new definitionClass(propertyKey);
                definitionContainer.addDefinition(definition);
            }
            definition[definitionProperty] = value;
        }
    }
}


export function getActivityDefinitionsFromClass(clazz: Newable<any>): ActivityDefinition[] {
    const defContainer: DefinitionContainer<ActivityDefinition> = (<DefinitionContainer<ActivityDefinition>>clazz.prototype[DEFINITION_SYMBOL]);
    if (defContainer) {
        return defContainer.toArray();
    } else {
        throw new DefinitionNotAvailableException(clazz);
    }
}