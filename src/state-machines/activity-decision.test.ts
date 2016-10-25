import {ActivityDecisionStateMachine, ActivityDecisionStates} from "./activity-decision";
import {HistoryEvent} from "../aws/aws.types";
import {EventType} from "../aws/workflow-history/event-types";

const TEST_ACTIVITY_TYPE = {
    name: 'test-activity',
    version: '1'
};

function createActivityScheduledEvent(activityId: string): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskScheduled],
        eventId: 10,
        activityTaskScheduledEventAttributes: {
            activityType: TEST_ACTIVITY_TYPE,
            activityId: activityId,
            input: 'createActivityScheduledEvent',
            control: 'control - createActivityScheduledEvent',
            scheduleToStartTimeout: '10',
            scheduleToCloseTimeout: '100',
            startToCloseTimeout: '1',
            taskList: {
                name: 'test task list'
            },
            decisionTaskCompletedEventId: 9,
            heartbeatTimeout: '11'
        }
    };
    return historyEvent;
}

function createScheduleActivityTaskFailed(activityId: string): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ScheduleActivityTaskFailed],
        eventId: 10,
        scheduleActivityTaskFailedEventAttributes: {
            activityType: TEST_ACTIVITY_TYPE,
            activityId: activityId,
            cause: 'createScheduleActivityTaskFailed - cause',
            decisionTaskCompletedEventId: 10
        }
    };

    return historyEvent;
}


function createActivityTaskStarted(): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskStarted],
        eventId: 10,
        activityTaskStartedEventAttributes: {
            identity: 'identity - ',
            scheduledEventId: 10
        }
    };

    return historyEvent;
}


function createActivityTaskCompleted(): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskCompleted],
        eventId: 10,
        activityTaskCompletedEventAttributes: {
            result: "result",
            scheduledEventId: 10,
            startedEventId: 10
        }
    };

    return historyEvent;
}


function createActivityTaskFailed(): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskFailed],
        eventId: 10,
        activityTaskFailedEventAttributes: {
            reason: 'reason',
            details: 'details',
            scheduledEventId: 10,
            startedEventId: 9
        }
    };
    return historyEvent;
}

function createActivityTaskTimedOut(): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskTimedOut],
        eventId: 10,
        activityTaskTimedOutEventAttributes: {
            timeoutType: 'timeout type',
            scheduledEventId: 10,
            startedEventId: 10,
            details: 'details createActivityTaskTimedOut'
        }
    };
    return historyEvent;
}

function createActivityTaskCanceled(): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskCanceled],
        eventId: 10,
        activityTaskCanceledEventAttributes: {
            details: 'details createActivityTaskCanceled',
            scheduledEventId: 10,
            startedEventId: 9,
            latestCancelRequestedEventId: 11
        }
    };
    return historyEvent;
}

function createActivityTaskCancelRequested(activityId: string): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.ActivityTaskCancelRequested],
        eventId: 10,
        activityTaskCancelRequestedEventAttributes: {
            decisionTaskCompletedEventId: 10,
            activityId: activityId
        }
    };
    return historyEvent;
}


function createRequestCancelActivityTaskFailed(activityId: string): HistoryEvent {
    const historyEvent: HistoryEvent = {
        eventTimestamp: 1234,
        eventType: EventType[EventType.RequestCancelActivityTaskFailed],
        eventId: 10,
        requestCancelActivityTaskFailedEventAttributes: {
            activityId: activityId,
            cause: 'cause createRequestCancelActivityTaskFailed',
            decisionTaskCompletedEventId: 10,
        }
    };
    return historyEvent;
}

describe('ActivityDecisionStateMachine', ()=> {

    /**
     ActivityTaskScheduled,
     ScheduleActivityTaskFailed,
     ActivityTaskStarted,
     ActivityTaskCompleted,
     ActivityTaskFailed,
     ActivityTaskTimedOut,
     ActivityTaskCanceled,
     ActivityTaskCancelRequested,
     RequestCancelActivityTaskFailed
     *
     */

    it('should handle ActivityTaskScheduled event', ()=> {
        const stateMachine = new ActivityDecisionStateMachine(ActivityDecisionStates.Created);

    });
});