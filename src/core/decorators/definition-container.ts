import {AbstractDecoratorDefinition} from "./abstract-decorator-definition";
export class DefinitionContainer<T extends AbstractDecoratorDefinition> {
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


}

