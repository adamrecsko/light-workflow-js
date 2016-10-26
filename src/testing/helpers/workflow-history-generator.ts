import {HistoryEvent, ActivityType, TaskList} from "../../aws/aws.types";
import {EventType} from "../../aws/workflow-history/event-types";
import * as  faker from 'faker';


const TEST_ACTIVITY_TYPE = {
    name: 'test-activity',
    version: '1'
};

const TEST_TASK_LIST = {
    name: 'test-task-list'
};

const randomTimestampGen = (): number=> {
    return faker.date.past().getTime();
};


export class HistoryGenerator {
    public timestampGen: ()=>number = randomTimestampGen;
    public defaultEventId: number = 10;

    public createHistoryEvent(eventType: EventType, eventId?: number): HistoryEvent {
        const historyEvent: HistoryEvent = {
            eventTimestamp: this.timestampGen(),
            eventType: EventType[eventType],
            eventId: eventId || this.defaultEventId
        };
        return historyEvent;
    }
}


export class ActivityHistoryGenerator extends HistoryGenerator {
    public activityType: ActivityType = TEST_ACTIVITY_TYPE;
    public taskList: TaskList = TEST_TASK_LIST;


    constructor() {
        super();
    }

    createActivityScheduledEvent(activityId: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskScheduled);
        historyEvent.activityTaskScheduledEventAttributes = {
            activityType: TEST_ACTIVITY_TYPE,
            activityId: activityId,
            input: 'createActivityScheduledEvent',
            control: 'control - createActivityScheduledEvent',
            scheduleToStartTimeout: '10',
            scheduleToCloseTimeout: '100',
            startToCloseTimeout: '1',
            taskList: this.taskList,
            decisionTaskCompletedEventId: 9,
            heartbeatTimeout: '11'
        };
        return historyEvent;
    }

    createScheduleActivityTaskFailed(activityId: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ScheduleActivityTaskFailed);
        historyEvent.scheduleActivityTaskFailedEventAttributes = {
            activityType: this.activityType,
            activityId: activityId,
            cause: 'createScheduleActivityTaskFailed - cause',
            decisionTaskCompletedEventId: 10
        };
        return historyEvent;
    }

    createActivityTaskStarted(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskStarted);
        historyEvent.activityTaskStartedEventAttributes = {
            identity: 'identity - createActivityTaskStarted',
            scheduledEventId: 10

        };
        return historyEvent;
    }

    createActivityTaskCompleted(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCompleted);
        historyEvent.activityTaskCompletedEventAttributes = {
            result: "result",
            scheduledEventId: 10,
            startedEventId: 10

        };
        return historyEvent;
    }

    createActivityTaskFailed(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskFailed);
        historyEvent.activityTaskFailedEventAttributes = {
            reason: 'reason',
            details: 'details',
            scheduledEventId: 10,
            startedEventId: 9

        };
        return historyEvent;
    }

    createActivityTaskTimedOut(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskTimedOut);
        historyEvent.activityTaskTimedOutEventAttributes = {
            timeoutType: 'timeout type',
            scheduledEventId: 10,
            startedEventId: 10,
            details: 'details createActivityTaskTimedOut'

        };
        return historyEvent;
    }

    createActivityTaskCanceled(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCanceled);
        historyEvent.activityTaskCanceledEventAttributes = {
            details: 'details createActivityTaskCanceled',
            scheduledEventId: 10,
            startedEventId: 9,
            latestCancelRequestedEventId: 11

        };
        return historyEvent;
    }

    createActivityTaskCancelRequested(activityId: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCancelRequested);
        historyEvent.activityTaskCancelRequestedEventAttributes = {
            decisionTaskCompletedEventId: 10,
            activityId: activityId

        };
        return historyEvent;
    }

    createRequestCancelActivityTaskFailed(activityId: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.RequestCancelActivityTaskFailed);
        historyEvent.requestCancelActivityTaskFailedEventAttributes = {
            activityId: activityId,
            cause: 'cause createRequestCancelActivityTaskFailed',
            decisionTaskCompletedEventId: 10,

        };
        return historyEvent;
    }
}