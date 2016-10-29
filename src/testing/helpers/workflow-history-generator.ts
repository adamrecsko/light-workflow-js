import {HistoryEvent, ActivityType, TaskList} from "../../aws/aws.types";
import {EventType} from "../../aws/workflow-history/event-types";
import  * as faker from 'faker';
import {ActivityDecisionStates, ActivityDecisionStateMachine} from "../../state-machines/activity-decision";
import {expect} from "chai";
import  * as uuid from 'node-uuid';

const randomTimestampGen = (): number=> {
    return faker.date.past().getTime();
};
const activityName = ()=>faker.helpers.slugify(`${uuid.v4()}  Actvivity`);
const taskListName = ()=>faker.helpers.slugify(`${faker.internet.domainName()} ${uuid.v4()} list`);

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
    public activityType: ActivityType;
    public taskList: TaskList;
    public activityId: string;

    constructor() {
        super();
        this.activityType = randomActivityType();
        this.taskList = randomTaskList();
        this.activityId = uuid.v4();
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

    createActivityTaskStarted(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskStarted);
        historyEvent.activityTaskStartedEventAttributes = {
            identity: `identity - createActivityTaskStarted ${uuid.v4()}`,
            scheduledEventId: 10

        };
        return historyEvent;
    }

    createActivityTaskCompleted(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCompleted);
        historyEvent.activityTaskCompletedEventAttributes = {
            result: `createActivityTaskCompleted - ${uuid.v4()}`,
            scheduledEventId: 10,
            startedEventId: 10

        };
        return historyEvent;
    }

    createActivityTaskFailed(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskFailed);
        historyEvent.activityTaskFailedEventAttributes = {
            reason: `createActivityTaskFailed reason - ${uuid.v4()}`,
            details: `createActivityTaskFailed details - ${uuid.v4()}`,
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
            details: `details createActivityTaskTimedOut ${uuid.v4()}`

        };
        return historyEvent;
    }

    createActivityTaskCanceled(): HistoryEvent {
        const historyEvent: HistoryEvent = this.createHistoryEvent(EventType.ActivityTaskCanceled);
        historyEvent.activityTaskCanceledEventAttributes = {
            details: `details createActivityTaskCanceled ${uuid.v4()}`,
            scheduledEventId: 10,
            startedEventId: 9,
            latestCancelRequestedEventId: 11

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
        const createEvent = (eventType: EventType) => {
            switch (eventType) {
                case EventType.ActivityTaskCanceled:
                    return this.createActivityTaskCanceled();
                case EventType.ActivityTaskCancelRequested:
                    return this.createActivityTaskCancelRequested();
                case EventType.ActivityTaskTimedOut:
                    return this.createActivityTaskTimedOut();
                case EventType.ActivityTaskCompleted:
                    return this.createActivityTaskCompleted();
                case EventType.ActivityTaskFailed:
                    return this.createActivityTaskFailed();
                case EventType.ActivityTaskScheduled:
                    return this.createActivityScheduledEvent();
                case EventType.ActivityTaskStarted:
                    return this.createActivityTaskStarted();
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

export function expectState(current: ActivityDecisionStates, expected: ActivityDecisionStates): void {
    expect(current)
        .to.eq(expected, `Current state ( ${ActivityDecisionStates[current]} ) not equal expected ( ${ActivityDecisionStates[expected]} )`);
}
export function expectStateMachine(sm: ActivityDecisionStateMachine,
                                   properties: any,
                                   currentState: ActivityDecisionStates) {

    if (properties !== null)
        expect(sm).to.contain.all.keys(properties);


    expectState(sm.currentState, currentState);
}
