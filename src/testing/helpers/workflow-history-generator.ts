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

    createActivityScheduledEvent(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskScheduled);
        historyEvent.activityTaskScheduledEventAttributes = {
            activityType: params.activityType || this.activityType,
            activityId: params.activityId || this.activityId,
            input: params.input || `createActivityScheduledEvent ${uuid.v4()}`,
            control: params.control || `control - createActivityScheduledEvent ${uuid.v4()}`,
            scheduleToStartTimeout: params.scheduleToStartTimeout || '100',
            scheduleToCloseTimeout: params.scheduleToCloseTimeout || '100',
            startToCloseTimeout: params.startToCloseTimeout || '100',
            taskList: params.taskList || this.taskList,
            decisionTaskCompletedEventId: params.decisionTaskCompletedEventId || -1,
            heartbeatTimeout: params.heartbeatTimeout || '100'
        };
        return historyEvent;
    }

    createScheduleActivityTaskFailed(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ScheduleActivityTaskFailed);
        historyEvent.scheduleActivityTaskFailedEventAttributes = {
            activityType: params.activityType || this.activityType,
            activityId: params.activityId || this.activityId,
            cause: params.cause || `createScheduleActivityTaskFailed - cause ${uuid.v4()}`,
            decisionTaskCompletedEventId: params.decisionTaskCompletedEventId || -1
        };
        return historyEvent;
    }

    createActivityTaskStarted(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskStarted);
        historyEvent.activityTaskStartedEventAttributes = {
            identity: params.identity || `identity - createActivityTaskStarted ${uuid.v4()}`,
            scheduledEventId: params.scheduledEventId || -1

        };
        return historyEvent;
    }

    createActivityTaskCompleted(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCompleted);
        historyEvent.activityTaskCompletedEventAttributes = {
            result: params.result || `createActivityTaskCompleted - ${uuid.v4()}`,
            scheduledEventId: params.scheduledEventId || -1,
            startedEventId: params.startedEventId || -1

        };
        return historyEvent;
    }

    createActivityTaskFailed(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskFailed);
        historyEvent.activityTaskFailedEventAttributes = {
            reason: params.reason || `createActivityTaskFailed reason - ${uuid.v4()}`,
            details: params.details || `createActivityTaskFailed details - ${uuid.v4()}`,
            scheduledEventId: params.scheduledEventId || -1,
            startedEventId: params.startedEventId || -1
        };
        return historyEvent;
    }

    createActivityTaskTimedOut(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskTimedOut);
        historyEvent.activityTaskTimedOutEventAttributes = {
            timeoutType: params.timeoutType || 'timeout type',
            scheduledEventId: params.scheduledEventId || -1,
            startedEventId: params.startedEventId || -1,
            details: params.details || `details createActivityTaskTimedOut ${uuid.v4()}`

        };
        return historyEvent;
    }

    createActivityTaskCanceled(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCanceled);
        historyEvent.activityTaskCanceledEventAttributes = {
            details: params.details || `details createActivityTaskCanceled ${uuid.v4()}`,
            scheduledEventId: params.scheduledEventId || 0,
            startedEventId: params.startedEventId || 0,
            latestCancelRequestedEventId: params.latestCancelRequestedEventId || -1

        };
        return historyEvent;
    }

    createActivityTaskCancelRequested(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCancelRequested);
        historyEvent.activityTaskCancelRequestedEventAttributes = {
            decisionTaskCompletedEventId: params.decisionTaskCompletedEventId || -1,
            activityId: params.activityId || this.activityId
        };
        return historyEvent;
    }

    createRequestCancelActivityTaskFailed(params: any): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.RequestCancelActivityTaskFailed);
        historyEvent.requestCancelActivityTaskFailedEventAttributes = {
            activityId: params.activityId || this.activityId,
            cause: params.cause || `cause createRequestCancelActivityTaskFailed ${uuid.v4()}`,
            decisionTaskCompletedEventId: params.decisionTaskCompletedEventId || -1,

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
                    return this.createActivityTaskCanceled({
                        scheduledEventId: lastScheduledEventId,
                        startedEventId: lastStartedEventId,
                        latestCancelRequestedEventId: lastCancelRequestEventId
                    });
                case EventType.ActivityTaskCancelRequested:
                    lastCancelRequestEventId = this.currentEventId;
                    return this.createActivityTaskCancelRequested({});
                case EventType.ActivityTaskTimedOut:
                    return this.createActivityTaskTimedOut({
                        scheduledEventId: lastScheduledEventId,
                        startedEventId: lastStartedEventId
                    });
                case EventType.ActivityTaskCompleted:
                    return this.createActivityTaskCompleted(
                        {
                            scheduledEventId: lastScheduledEventId,
                            startedEventId: lastStartedEventId
                        }
                    );
                case EventType.ActivityTaskFailed:
                    return this.createActivityTaskFailed({
                        scheduledEventId: lastScheduledEventId,
                        startedEventId: lastStartedEventId
                    });
                case EventType.ActivityTaskScheduled:
                    lastScheduledEventId = this.currentEventId;
                    return this.createActivityScheduledEvent({});
                case EventType.ActivityTaskStarted:
                    lastStartedEventId = this.currentEventId;
                    return this.createActivityTaskStarted({
                        scheduledEventId: lastScheduledEventId
                    });
                case EventType.RequestCancelActivityTaskFailed:
                    return this.createRequestCancelActivityTaskFailed({});
                case EventType.ScheduleActivityTaskFailed:
                    return this.createScheduleActivityTaskFailed({});

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

