import {ActivityDefinition} from "./activity-definition";
export class ActivityDefinitionsContainer {
    private activityMap: Map<string,ActivityDefinition> = new Map();

    public addDefinition(definition: ActivityDefinition): void {
        this.activityMap.set(definition.name, definition);
    }

    public getDefinitionToProperty(propertyKey: string): ActivityDefinition {
        return this.activityMap.get(propertyKey);
    }

    public hasDefinition(propertyKey: string): boolean {
        return this.activityMap.has(propertyKey);
    }

    public toArray(): ActivityDefinition[] {
        return Array.from(this.activityMap.values());
    }
}
