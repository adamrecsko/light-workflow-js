import {AbstractDecoratorDefinition} from "../abstract-decorator-definition";
export class ActivityDefinition extends AbstractDecoratorDefinition {
    defaultTaskHeartbeatTimeout: string;
    defaultTaskScheduleToCloseTimeout: string;
    defaultTaskScheduleToStartTimeout: string;
    defaultTaskStartToCloseTimeout: string;
    heartbeatTimeout: string;
    scheduleToCloseTimeout: string;
    scheduleToStartTimeout: string;
    startToCloseTimeout: string;
}