import {ActivityHistoryGenerator} from "./workflow-history-generator";
import {EventType} from "../../aws/workflow-history/event-types";
import {HistoryEvent} from "../../aws/aws.types";
import * as chai from 'chai';
chai.use(require('chai-shallow-deep-equal'));

import {expect} from "chai";


function getParams(event: HistoryEvent): any {
    const eventType = event.eventType;
    const eventAttributes: string = eventType.charAt(0).toLocaleLowerCase()
        + eventType.slice(1)
        + 'EventAttributes';

    return (<any>event)[eventAttributes];
}

type EventExpectation = {
    eventType: EventType,
    params: any,
    eventId: number
};


function expectHistoryEvent(event: HistoryEvent, expectation: EventExpectation): void {
    const eventType = EventType.fromString(event.eventType);
    expect(eventType).to.eq(expectation.eventType, `Expected: ${EventType[expectation.eventType]}  but got: ${event.eventType}`);
    (<any>expect(getParams(event)).to).shallowDeepEqual(expectation.params);
    expect(event.eventId).to.eq(expectation.eventId);
}

describe('ActivityHistoryGenerator', ()=> {
    it('should generate a workflow history', ()=> {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
            EventType.ActivityTaskScheduled,
            EventType.ActivityTaskStarted,
            EventType.ActivityTaskCompleted
        ]);
        expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: {
                activityId: historyGenerator.activityId
            },
            eventId: 1
        });
        expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: {
                scheduledEventId: 1
            },
            eventId: 2
        });
        expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskCompleted,
            params: {
                scheduledEventId: 1,
                startedEventId: 2
            },
            eventId: 3
        });
    });

    it('should generate a workflow history', ()=> {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
            EventType.ActivityTaskScheduled,
            EventType.ActivityTaskStarted,
            EventType.ActivityTaskFailed
        ]);
        expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: {
                activityId: historyGenerator.activityId
            },
            eventId: 1
        });
        expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: {
                scheduledEventId: 1
            },
            eventId: 2
        });
        expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskFailed,
            params: {
                scheduledEventId: 1,
                startedEventId: 2
            },
            eventId: 3
        });
    });
    it('should generate a workflow history if activity cancelled', ()=> {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
            EventType.ActivityTaskScheduled,
            EventType.ActivityTaskStarted,
            EventType.ActivityTaskCancelRequested,
            EventType.ActivityTaskCanceled

        ]);
        expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: {
                activityId: historyGenerator.activityId
            },
            eventId: 1
        });
        expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: {
                scheduledEventId: 1
            },
            eventId: 2
        });
        expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskCancelRequested,
            params: {
                activityId: historyGenerator.activityId
            },
            eventId: 3
        });
        expectHistoryEvent(list[3], {
            eventType: EventType.ActivityTaskCanceled,
            params: {
                scheduledEventId: 1,
                startedEventId: 2,
                latestCancelRequestedEventId: 3
            },
            eventId: 4
        });


    });
});