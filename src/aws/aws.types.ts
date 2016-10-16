import {Swf} from 'aws-sdk';


export type ActivityTask =  Swf.ActivityTask;
export type ActivityType = Swf.ActivityType;


export class TaskList {
    public name:string;
}

export class ActivityDefinition {
    public domain:string;
    public activityType:ActivityType;
    public description:string;
    public defaultTaskStartToCloseTimeout:string;
    public defaultTaskHeartbeatTimeout:string;
    public defaultTaskList:TaskList;
    public defaultTaskScheduleToStartTimeout:string;
    public defaultTaskScheduleToCloseTimeout:string;
}


export class ActivityPollParameters {
    public domain:string;
    public taskList:TaskList;
    public identity:string;
}