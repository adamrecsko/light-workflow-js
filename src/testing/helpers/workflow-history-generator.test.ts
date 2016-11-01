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
    describe('createActivityScheduledEvent', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    activityType: 'testActivityType',
                    activityId: 'testActivityId',
                    input: 'testInput',
                    control: 'testControl',
                    scheduleToStartTimeout: 'test schedule to start timeout',
                    scheduleToCloseTimeout: 'testScheduleToClose timeout',
                    startToCloseTimeout: 'test start to close timeout',
                    taskList: 'test task list',
                    decisionTaskCompletedEventId: 11111,
                    heartbeatTimeout: 'test heartbeatTimeout'
                };
                const historyEvent = generator.createActivityScheduledEvent(expected);

                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskScheduled,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    activityType: generator.activityType,
                    activityId: generator.activityId,
                    taskList: generator.taskList,
                    decisionTaskCompletedEventId: -1
                };
                const historyEvent = generator.createActivityScheduledEvent({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskScheduled,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });

    describe('createScheduleActivityTaskFailed', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    activityType: 'test activity type',
                    activityId: 'test actvity id',
                    cause: 'test cause',
                    decisionTaskCompletedEventId: 11111
                };
                const historyEvent = generator.createScheduleActivityTaskFailed(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ScheduleActivityTaskFailed,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    activityType: generator.activityType,
                    activityId: generator.activityId,
                };
                const historyEvent = generator.createScheduleActivityTaskFailed({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ScheduleActivityTaskFailed,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });


    describe('createActivityTaskStarted', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    identity: 'test activity type',
                    scheduledEventId: 11111
                };
                const historyEvent = generator.createActivityTaskStarted(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskStarted,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createActivityTaskStarted({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskStarted,
                    params: {},
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });

    describe('createActivityTaskCompleted', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    result: 'test result',
                    scheduledEventId: 11111,
                    startedEventId: 22222
                };
                const historyEvent = generator.createActivityTaskCompleted(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskCompleted,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createActivityTaskStarted({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskStarted,
                    params: {},
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });

    describe('createActivityTaskFailed', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    reason: 'test reason',
                    details: 'test details',
                    scheduledEventId: 11111,
                    startedEventId: 222222
                };
                const historyEvent = generator.createActivityTaskFailed(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskFailed,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createActivityTaskFailed({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskFailed,
                    params: {},
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });

    describe('createActivityTaskTimedOut', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    timeoutType: 'timeout type test',
                    scheduledEventId: 11111,
                    startedEventId: 22222,
                    details: 'test details'
                };
                const historyEvent = generator.createActivityTaskTimedOut(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskTimedOut,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createActivityTaskTimedOut({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskTimedOut,
                    params: {},
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });

    describe('createActivityTaskCanceled', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    details: 'details test',
                    scheduledEventId: 11111,
                    startedEventId: 222222,
                    latestCancelRequestedEventId: 33333
                };
                const historyEvent = generator.createActivityTaskCanceled(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskCanceled,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createActivityTaskCanceled({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskCanceled,
                    params: {},
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });


    describe('createActivityTaskCancelRequested', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    decisionTaskCompletedEventId: 11111,
                    activityId: 'test activity id'
                };
                const historyEvent = generator.createActivityTaskCancelRequested(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskCancelRequested,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createActivityTaskCancelRequested({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.ActivityTaskCancelRequested,
                    params: {
                        activityId: generator.activityId
                    },
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });


    describe('createRequestCancelActivityTaskFailed', ()=> {
        context('with parameters', ()=> {
            it('should create HistoryEvent with the given parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const expected = {
                    activityId: 'test activity id',
                    cause: 'test cause',
                    decisionTaskCompletedEventId: 2222,
                };
                const historyEvent = generator.createRequestCancelActivityTaskFailed(expected);
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.RequestCancelActivityTaskFailed,
                    params: expected,
                    eventId: generator.currentEventId - 1
                });
            });
        });

        context('without params', ()=> {
            it('should create history event with default parameters', ()=> {
                const generator = new ActivityHistoryGenerator();
                const historyEvent = generator.createRequestCancelActivityTaskFailed({});
                expectHistoryEvent(historyEvent, {
                    eventType: EventType.RequestCancelActivityTaskFailed,
                    params: {
                        activityId: generator.activityId
                    },
                    eventId: generator.currentEventId - 1
                });
            });
        });
    });

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