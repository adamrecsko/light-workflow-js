import {AbstractDecoratorDefinition} from "./abstract-decorator-definition";


export interface DefinitionContainer <T extends AbstractDecoratorDefinition> {
    addDefinition(definition: T): void;
    getDefinitionToProperty(decoratedPropertyName: string): T;
    hasDefinition(propertyKey: string): boolean;
    toArray(): T[];
    createOrGetDefinitionToDecoratedProperty(decoratedPropertyName: string): T;
}


export abstract class AbstractDefinitionContainer<T extends AbstractDecoratorDefinition>  implements DefinitionContainer <T> {
    private definitionMap: Map<string,T> = new Map();

    public addDefinition(definition: T): void {
        this.definitionMap.set(definition.decoratedMethodName, definition);
    }

    public getDefinitionToProperty(decoratedPropertyName: string): T {
        return this.definitionMap.get(decoratedPropertyName);
    }

    public hasDefinition(propertyKey: string): boolean {
        return this.definitionMap.has(propertyKey);
    }

    public toArray(): T[] {
        return Array.from<T>(this.definitionMap.values());
    }

    public createOrGetDefinitionToDecoratedProperty(decoratedPropertyName: string): T {
        let decoratorDefinition: T;
        if (this.hasDefinition(decoratedPropertyName)) {
            decoratorDefinition = this.getDefinitionToProperty(decoratedPropertyName);
        } else {
            decoratorDefinition = this.createDefinition(decoratedPropertyName);
            this.addDefinition(decoratorDefinition);
        }
        return decoratorDefinition;
    }

    protected abstract createDefinition(decoratedPropertyName: string): T;

}

