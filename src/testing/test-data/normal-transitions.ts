import {EventType} from "../../aws/workflow-history/event-types";


export const FAILED_TRANSITION = [
    EventType.ActivityTaskScheduled,
    EventType.ActivityTaskStarted,
    EventType.ActivityTaskFailed
];

export const COMPETED_TRANSITION = [
    EventType.ActivityTaskScheduled,
    EventType.ActivityTaskStarted,
    EventType.ActivityTaskCompleted
];

export const TIMEOUTED_TRANSITION = [
    EventType.ActivityTaskScheduled,
    EventType.ActivityTaskStarted,
    EventType.ActivityTaskTimedOut
];

export const CANCELLED_TRANSITION = [
    EventType.ActivityTaskScheduled,
    EventType.ActivityTaskStarted,
    EventType.ActivityTaskCancelRequested,
    EventType.ActivityTaskCanceled
];

export const CANCEL_FAILED_TRANSITION = [
    EventType.ActivityTaskScheduled,
    EventType.ActivityTaskStarted,
    EventType.ActivityTaskCancelRequested,
    EventType.RequestCancelActivityTaskFailed
];