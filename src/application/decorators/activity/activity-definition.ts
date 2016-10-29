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