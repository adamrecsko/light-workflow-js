import {HistoryEvent, ActivityType, TaskList} from "../../aws/aws.types";
import {EventType} from "../../aws/workflow-history/event-types";
import  * as faker from 'faker';
import  * as uuid from 'node-uuid';
import {HistoryGenerator} from "./history-event-generator";


const activityName =
    ()=>faker.helpers.slugify(`${uuid.v4()}  Activity`);
const taskListName =
    ()=>faker.helpers.slugify(`${faker.internet.domainName()} ${uuid.v4()} list`);
const randomActivityType = ()=> {
    return {
        name: activityName(),
        version: `${Math.random() * 1000}`
    }
};
const randomTaskList = ()=> {
    return {
        name: taskListName()
    };
};

export class ActivityHistoryGenerator extends HistoryGenerator {
    public activityType: ActivityType;
    public taskList: TaskList;
    public activityId: string;

    constructor(activityType?: ActivityType, taskList?: TaskList, activityId?: string) {
        super();
        this.activityType = activityType || randomActivityType();
        this.taskList = taskList || randomTaskList();
        this.activityId = activityId || uuid.v4();
    }

    createActivityScheduledEvent(activityId?: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskScheduled);
        historyEvent.activityTaskScheduledEventAttributes = {
            activityType: this.activityType,
            activityId: activityId || this.activityId,
            input: `createActivityScheduledEvent ${uuid.v4()}`,
            control: `control - createActivityScheduledEvent ${uuid.v4()}`,
            scheduleToStartTimeout: '10',
            scheduleToCloseTimeout: '100',
            startToCloseTimeout: '1',
            taskList: this.taskList,
            decisionTaskCompletedEventId: 9,
            heartbeatTimeout: '11'
        };
        return historyEvent;
    }

    createScheduleActivityTaskFailed(activityId?: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ScheduleActivityTaskFailed);
        historyEvent.scheduleActivityTaskFailedEventAttributes = {
            activityType: this.activityType,
            activityId: activityId || this.activityId,
            cause: `createScheduleActivityTaskFailed - cause ${uuid.v4()}`,
            decisionTaskCompletedEventId: 10
        };
        return historyEvent;
    }

    createActivityTaskStarted(scheduledEventId?: number): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskStarted);
        historyEvent.activityTaskStartedEventAttributes = {
            identity: `identity - createActivityTaskStarted ${uuid.v4()}`,
            scheduledEventId: scheduledEventId || 10

        };
        return historyEvent;
    }

    createActivityTaskCompleted(scheduledEventId?: number, startedEventId?: number): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCompleted);
        historyEvent.activityTaskCompletedEventAttributes = {
            result: `createActivityTaskCompleted - ${uuid.v4()}`,
            scheduledEventId: scheduledEventId || 10,
            startedEventId: startedEventId || 10

        };
        return historyEvent;
    }

    createActivityTaskFailed(scheduledEventId?: number, startedEventId?: number): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskFailed);
        historyEvent.activityTaskFailedEventAttributes = {
            reason: `createActivityTaskFailed reason - ${uuid.v4()}`,
            details: `createActivityTaskFailed details - ${uuid.v4()}`,
            scheduledEventId: scheduledEventId || 10,
            startedEventId: startedEventId || 10

        };
        return historyEvent;
    }

    createActivityTaskTimedOut(scheduledEventId?: number, startedEventId?: number): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskTimedOut);
        historyEvent.activityTaskTimedOutEventAttributes = {
            timeoutType: 'timeout type',
            scheduledEventId: scheduledEventId || 10,
            startedEventId: startedEventId || 10,
            details: `details createActivityTaskTimedOut ${uuid.v4()}`

        };
        return historyEvent;
    }

    createActivityTaskCanceled(scheduledEventId?: number, startedEventId?: number, latestCancelRequestedEventId?: number): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCanceled);
        historyEvent.activityTaskCanceledEventAttributes = {
            details: `details createActivityTaskCanceled ${uuid.v4()}`,
            scheduledEventId: scheduledEventId || 10,
            startedEventId: startedEventId || 10,
            latestCancelRequestedEventId: latestCancelRequestedEventId || 11

        };
        return historyEvent;
    }

    createActivityTaskCancelRequested(activityId?: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCancelRequested);
        historyEvent.activityTaskCancelRequestedEventAttributes = {
            decisionTaskCompletedEventId: 10,
            activityId: activityId || this.activityId

        };
        return historyEvent;
    }

    createRequestCancelActivityTaskFailed(activityId?: string): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.RequestCancelActivityTaskFailed);
        historyEvent.requestCancelActivityTaskFailedEventAttributes = {
            activityId: activityId || this.activityId,
            cause: `cause createRequestCancelActivityTaskFailed ${uuid.v4()}`,
            decisionTaskCompletedEventId: 10,

        };
        return historyEvent;
    }

    createActivityList(events: EventType[]): HistoryEvent[] {
        let lastScheduledEventId: number;
        let lastStartedEventId: number;
        let lastCancelRequestEventId: number;
        const createEvent = (eventType: EventType) => {
            switch (eventType) {
                case EventType.ActivityTaskCanceled:
                    return this.createActivityTaskCanceled(lastScheduledEventId, lastStartedEventId, lastCancelRequestEventId);
                case EventType.ActivityTaskCancelRequested:
                    lastCancelRequestEventId = this.currentEventId;
                    return this.createActivityTaskCancelRequested();
                case EventType.ActivityTaskTimedOut:
                    return this.createActivityTaskTimedOut(lastScheduledEventId, lastStartedEventId);
                case EventType.ActivityTaskCompleted:
                    return this.createActivityTaskCompleted(lastScheduledEventId, lastStartedEventId);
                case EventType.ActivityTaskFailed:
                    return this.createActivityTaskFailed(lastScheduledEventId, lastStartedEventId);
                case EventType.ActivityTaskScheduled:
                    lastScheduledEventId = this.currentEventId;
                    return this.createActivityScheduledEvent();
                case EventType.ActivityTaskStarted:
                    lastStartedEventId = this.currentEventId;
                    return this.createActivityTaskStarted(lastScheduledEventId);
                case EventType.RequestCancelActivityTaskFailed:
                    return this.createRequestCancelActivityTaskFailed();
                case EventType.ScheduleActivityTaskFailed:
                    return this.createScheduleActivityTaskFailed();

                default:
                    throw new Error('Unknown event type');

            }
        };
        return events.map(createEvent);
    }


    static generateList(events: EventType[][]): HistoryEvent[] {
        const listOfList = events.map((evtList: EventType[])=> {
            const generator = new ActivityHistoryGenerator();
            return generator.createActivityList(evtList);
        });
        return [].concat.apply([], listOfList);
    }

}

