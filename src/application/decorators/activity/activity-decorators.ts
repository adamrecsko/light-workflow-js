export type Decorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor)=>void;
export const ACTIVITY_DEFINITIONS = Symbol('ACTIVITY_DEFINITIONS');
export enum ActivityDefinitionProperty{
    name,
    version,
    defaultTaskHeartbeatTimeout,
    defaultTaskPriority,
    defaultTaskScheduleToCloseTimeout,
    defaultTaskScheduleToStartTimeout,
    defaultTaskStartToCloseTimeout,
    description,
    heartbeatTimeout,
    scheduleToCloseTimeout,
    scheduleToStartTimeout,
    startToCloseTimeout,
    taskPriority
}
export class ActivityDefinition {
    name: string;
    version: string = '1';
    defaultTaskHeartbeatTimeout: string;
    defaultTaskPriority: string;
    defaultTaskScheduleToCloseTimeout: string;
    defaultTaskScheduleToStartTimeout: string;
    defaultTaskStartToCloseTimeout: string;
    description: string;
    heartbeatTimeout: string;
    scheduleToCloseTimeout: string;
    scheduleToStartTimeout: string;
    startToCloseTimeout: string;
    taskPriority: string;
    [key: string]: any;

    constructor(name: string) {
        this.name = name;
    }
}


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


//utils
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


export class DefinitionNotAvailableException extends Error {
    constructor(clazz: any) {
        super(`Activity definition not found on class: ${clazz}.`);
    }
}

export function getActivityDefinitionsFromClass(clazz: any): ActivityDefinition[] {
    const defContainer: ActivityDefinitionsContainer = (<ActivityDefinitionsContainer>clazz.prototype[ACTIVITY_DEFINITIONS]);
    if (defContainer) {
        return defContainer.toArray();
    } else {
        throw new DefinitionNotAvailableException(clazz);
    }
}


//decorators
export const version = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.version);
export const defaultTaskHeartbeatTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskHeartbeatTimeout);
export const defaultTaskPriority = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
export const defaultTaskScheduleToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskScheduleToCloseTimeout);
export const defaultTaskScheduleToStartTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskScheduleToStartTimeout);
export const defaultTaskStartToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskStartToCloseTimeout);
export const description = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.description);
export const heartbeatTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.heartbeatTimeout);
export const scheduleToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.scheduleToCloseTimeout);
export const scheduleToStartTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.scheduleToStartTimeout);
export const startToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.startToCloseTimeout);
export const taskPriority = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.taskPriority);

