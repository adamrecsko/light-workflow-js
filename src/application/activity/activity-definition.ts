import {BaseDefinition} from "../definition";
export class ActivityDefinition extends BaseDefinition {
    defaultTaskHeartbeatTimeout: string;
    defaultTaskScheduleToCloseTimeout: string;
    defaultTaskScheduleToStartTimeout: string;
    defaultTaskStartToCloseTimeout: string;
    heartbeatTimeout: string;
    scheduleToCloseTimeout: string;
    scheduleToStartTimeout: string;
    startToCloseTimeout: string;
}