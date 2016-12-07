import {BaseDefinition} from "./definition";
export class DefinitionContainer<T extends BaseDefinition> {
    private definitionMap: Map<string,T> = new Map();

    public addDefinition(definition: T): void {
        this.definitionMap.set(definition.name, definition);
    }

    public getDefinitionToProperty(propertyKey: string): T {
        return this.definitionMap.get(propertyKey);
    }

    public hasDefinition(propertyKey: string): boolean {
        return this.definitionMap.has(propertyKey);
    }

    public toArray(): T[] {
        return Array.from<T>(this.definitionMap.values());
    }
}
