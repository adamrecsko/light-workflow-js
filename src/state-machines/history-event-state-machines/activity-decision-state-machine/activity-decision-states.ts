import {EventType} from "../../../aws/workflow-history/event-types";
export enum ActivityDecisionStates{
    Created = 1,
    CanceledBeforeSent,
    Sending,
    Sent,
    CancelledAfterSent,
    Scheduled = EventType.ActivityTaskScheduled,
    ScheduleFailed = EventType.ActivityTaskFailed,
    Started = EventType.ActivityTaskStarted,
    Completed = EventType.ActivityTaskCompleted,
    Failed = EventType.ActivityTaskFailed,
    TimedOut = EventType.ActivityTaskTimedOut,
    Canceled = EventType.ActivityTaskCanceled,
    CancelRequested = EventType.ActivityTaskCancelRequested,
    RequestCancelFailed = EventType.RequestCancelActivityTaskFailed
}
