import {Newable} from "../../implementation";
import {AbstractDecoratorDefinition} from "../abstract-decorator-definition";
import {DefinitionContainer} from "../definition-container";


export const DEFINITION_SYMBOL = Symbol('DEFINITION_SYMBOL');
export type Decorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor)=>void;
export type ValueSetterDecoratorFactory<T> = (value: T)=>Decorator;


export class DefinitionNotAvailableException extends Error {
    constructor(clazz: Newable<any>) {
        super(`Definition not found on class: ${clazz}.`);
    }
}

export function definitionPropertySetterFactory<T,D extends AbstractDecoratorDefinition>(definitionProperty: string,
                                                                                         definitionClass: Newable<D>): ValueSetterDecoratorFactory<T> {
    return function (value: T): Decorator {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
            const definitionContainer: DefinitionContainer<D> = target[DEFINITION_SYMBOL] = target[DEFINITION_SYMBOL] || new DefinitionContainer<D>();
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


export function getDefinitionsFromClass<T extends AbstractDecoratorDefinition>(clazz: Newable<any>): T[] {
    const defContainer: DefinitionContainer<T> = (<DefinitionContainer<T>>clazz.prototype[DEFINITION_SYMBOL]);
    if (defContainer) {
        return defContainer.toArray();
    } else {
        throw new DefinitionNotAvailableException(clazz);
    }
}