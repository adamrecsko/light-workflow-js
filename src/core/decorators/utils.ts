import {Newable} from "../../implementation";
import {AbstractDecoratorDefinition} from "./abstract-decorator-definition";
import {AbstractDefinitionContainer} from "./definition-container";


export const DEFINITION_SYMBOL = Symbol('DEFINITION_SYMBOL');
export type Decorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor)=>void;
export type ValueSetterDecoratorFactory<T> = (value: T)=>Decorator;


export class DefinitionNotAvailableException extends Error {
    constructor(clazz: Newable<any>) {
        super(`Definition not found on class: ${clazz}.`);
    }
}


export function definitionCreatorFactory<T extends AbstractDecoratorDefinition>(definitionContainerClass: Newable<AbstractDefinitionContainer<T>>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
        target[DEFINITION_SYMBOL] = target[DEFINITION_SYMBOL] || new definitionContainerClass();
    }
}

export function definitionPropertySetterFactory<T,D extends AbstractDecoratorDefinition>(definitionProperty: string, definitionContainerClass: Newable<AbstractDefinitionContainer<D>>): ValueSetterDecoratorFactory<T> {
    return function (value: T): Decorator {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
            definitionCreatorFactory(definitionContainerClass)(target, propertyKey, descriptor);
            const definitionContainer: AbstractDefinitionContainer<D> = target[DEFINITION_SYMBOL];
            const definition: D = definitionContainer.createOrGetDefinitionToDecoratedProperty(propertyKey);
            definition[definitionProperty] = value;
        }
    }
}


export function getDefinitionsFromClass<T extends AbstractDecoratorDefinition>(clazz: Newable<any>): T[] {
    const defContainer: AbstractDefinitionContainer<T> = (<AbstractDefinitionContainer<T>>clazz.prototype[DEFINITION_SYMBOL]);
    if (defContainer) {
        return defContainer.toArray();
    } else {
        throw new DefinitionNotAvailableException(clazz);
    }
}