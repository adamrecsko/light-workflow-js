import {AbstractDecoratorDefinition} from "../decorators/abstract-decorator-definition";
export class DeciderDefinition extends AbstractDecoratorDefinition {
    defaultTaskHeartbeatTimeout: string;
    defaultTaskScheduleToCloseTimeout: string;
    defaultTaskScheduleToStartTimeout: string;
    defaultTaskStartToCloseTimeout: string;
    heartbeatTimeout: string;
    scheduleToCloseTimeout: string;
    scheduleToStartTimeout: string;
    startToCloseTimeout: string;
}

export enum DeciderDefinitionProperty{
    name = 1,
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
    taskPriority,
    serializer
}