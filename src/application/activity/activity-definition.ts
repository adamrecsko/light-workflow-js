import {Serializer, defaultSerializer} from "./serializer";
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
    serializer: Serializer = defaultSerializer;
    _decoratedMethodName: string;
    [key: string]: any;
    constructor(decoratedMethodName: string) {
        this._decoratedMethodName = decoratedMethodName;
        this.name = decoratedMethodName;
    }
}