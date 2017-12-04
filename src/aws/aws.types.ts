import {SWF} from 'aws-sdk';


export type ActivityTask = SWF.Types.ActivityTask;
export type ActivityType = SWF.Types.ActivityType;
export type DecisionTask = SWF.Types.DecisionTask;
export type HistoryEvent = SWF.Types.HistoryEvent;
export type ScheduleActivityTaskDecisionAttributes = SWF.Types.ScheduleActivityTaskDecisionAttributes;
export type WorkflowStartParameters = SWF.Types.StartWorkflowExecutionInput;
export type Run = SWF.Types.Run;
export type RegisterWorkflowTypeInput = SWF.Types.RegisterWorkflowTypeInput;


export class TaskList {
  public name: string;
}

export class ActivityRegistrationParameters {
  public domain: string;
  public name: string;
  public version: string;
  public description: string;
  public defaultTaskStartToCloseTimeout: string;
  public defaultTaskHeartbeatTimeout: string;
  public defaultTaskList: TaskList;
  public defaultTaskScheduleToStartTimeout: string;
  public defaultTaskScheduleToCloseTimeout: string;
}


export class ActivityPollParameters {
  public domain: string;
  public taskList: TaskList;
  public identity?: string;

  constructor(domain: string, taskList: TaskList, identity?: string) {
    this.domain = domain;
    this.taskList = taskList;
    this.identity = identity;
  }
}

export class DecisionPollParameters {
  public domain: string;
  public taskList: TaskList;
  public identity?: string;
  public maximumPageSize: number;
  public nextPageToken?: string;
  public reverseOrder: boolean;


  public copy(): DecisionPollParameters {
    const result = new DecisionPollParameters();
    result.domain = this.domain;
    result.taskList = this.taskList;
    result.identity = this.identity;
    result.maximumPageSize = this.maximumPageSize;
    result.nextPageToken = this.nextPageToken;
    result.reverseOrder = this.reverseOrder;
    return result;
  }

  public nextPage(nextPageToken: string): DecisionPollParameters {
    const result = this.copy();
    result.nextPageToken = nextPageToken;
    return result;
  }
}
