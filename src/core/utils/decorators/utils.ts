import { Newable } from '../../../implementation';
import { AbstractDecoratorDefinition } from './abstract-decorator-definition';
import { AbstractDefinitionContainer } from './definition-container';


export const DEFINITION_SYMBOL = Symbol('DEFINITION_SYMBOL');
export type Decorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export type ClassLevelDecorator = (constructor: Function) => void;
export type ValueSetterDecoratorFactory<T, R> = (value?: T) => R;


export class DefinitionNotAvailableException extends Error {
  constructor(newable: Newable<any>) {
    super(`Definition not found on class: ${newable}.`);
  }
}


export function definitionCreatorFactory<D>(definitionContainerClass: Newable<D>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    target[DEFINITION_SYMBOL] = target[DEFINITION_SYMBOL] || new definitionContainerClass();
  };
}

export function propertyLevelDefinition<T, D extends AbstractDecoratorDefinition>(definitionProperty: keyof D,
                                                                                  definitionContainerClass: Newable<AbstractDefinitionContainer<D>>): ValueSetterDecoratorFactory<T, Decorator> {
  return function (value: T): Decorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
      definitionCreatorFactory(definitionContainerClass)(target, propertyKey, descriptor);
      const definitionContainer: AbstractDefinitionContainer<D> = target[DEFINITION_SYMBOL];
      const definition: D = definitionContainer.createOrGetDefinitionToDecoratedProperty(propertyKey);

      if (value !== undefined) {
        definition[definitionProperty] = value as any;
      }
    };
  };
}

export function classLevelDefinition<T, D>(definitionProperty: keyof D, definitionClass: Newable<D>): ValueSetterDecoratorFactory<T, ClassLevelDecorator> {
  return function (value: T): ClassLevelDecorator {
    return function (constructor: Function): void {
      definitionCreatorFactory(definitionClass)(constructor.prototype, undefined, undefined);
      const definition: D = constructor.prototype[DEFINITION_SYMBOL];
      if (value !== undefined) {
        definition[definitionProperty] = value as any;
      }
    };
  };
}

export function getPropertyLevelDefinitionsFromClass<T extends AbstractDecoratorDefinition>(newable: Newable<any>): T[] {
  const defContainer: AbstractDefinitionContainer<T> = (<AbstractDefinitionContainer<T>>newable.prototype[DEFINITION_SYMBOL]);
  if (defContainer) {
    return defContainer.toArray();
  }
  throw new DefinitionNotAvailableException(newable);
}


export function getClassLevelDefinitionsFromClass<T>(newable: Newable<any>): T {
  const definition: T = newable.prototype[DEFINITION_SYMBOL] as T;
  if (definition) {
    return definition;
  }
  throw new DefinitionNotAvailableException(newable);
}

