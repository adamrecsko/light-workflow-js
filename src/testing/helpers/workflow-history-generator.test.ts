import { ActivityHistoryGenerator } from './workflow-history-generator';
import { EventType } from '../../aws/workflow-history/event-types';
import { HistoryEvent } from '../../aws/aws.types';
import * as chai from 'chai';

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;
import {
  SCHEDULED_PARAMS, STARTED_PARAMS, COMPLETED_PARAMS, FAILED_PARAMS,
  REQUEST_CANCELLED_PARAMS, CANCELLED_PARAMS, TIMEOUT_PARAMS,
} from '../test-data/event-params';
import {
  COMPLETED_TRANSITION, FAILED_TRANSITION, CANCELLED_TRANSITION,
  TIMEOUTED_TRANSITION,
} from '../test-data/normal-transitions';
import { WorkflowExecutionStartedEventAttributes } from 'aws-sdk/clients/swf';


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
  eventId: number,
};


function expectHistoryEvent(event: HistoryEvent, expectation: EventExpectation): void {
  const eventType = EventType.fromString(event.eventType);
  expect(eventType).to.eq(expectation.eventType, `Expected: ${EventType[expectation.eventType]}  but got: ${event.eventType}`);
  (<any>expect(getParams(event)).to).shallowDeepEqual(expectation.params);
  expect(event.eventId).to.eq(expectation.eventId);
}


function merge(obj1: any, obj2: any): any {
  return Object.assign({}, obj1, obj2);
}

describe('ActivityHistoryGenerator', () => {
  describe('createActivityScheduledEvent', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
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
          heartbeatTimeout: 'test heartbeatTimeout',
        };
        const historyEvent = generator.createActivityScheduledEvent(expected);

        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskScheduled,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          activityType: generator.activityType,
          activityId: generator.activityId,
          taskList: generator.taskList,
          decisionTaskCompletedEventId: 0,
        };
        const historyEvent = generator.createActivityScheduledEvent({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskScheduled,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });

  describe('createScheduleActivityTaskFailed', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          activityType: 'test activity type',
          activityId: 'test actvity id',
          cause: 'test cause',
          decisionTaskCompletedEventId: 11111,
        };
        const historyEvent = generator.createScheduleActivityTaskFailed(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ScheduleActivityTaskFailed,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          activityType: generator.activityType,
          activityId: generator.activityId,
        };
        const historyEvent = generator.createScheduleActivityTaskFailed({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ScheduleActivityTaskFailed,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });


  describe('createActivityTaskStarted', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          identity: 'test activity type',
          scheduledEventId: 11111,
        };
        const historyEvent = generator.createActivityTaskStarted(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskStarted,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createActivityTaskStarted({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskStarted,
          params: {},
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });

  describe('createActivityTaskCompleted', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          result: 'test result',
          scheduledEventId: 11111,
          startedEventId: 22222,
        };
        const historyEvent = generator.createActivityTaskCompleted(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskCompleted,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createActivityTaskStarted({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskStarted,
          params: {},
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });

  describe('createActivityTaskFailed', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          reason: 'test reason',
          details: 'test details',
          scheduledEventId: 11111,
          startedEventId: 222222,
        };
        const historyEvent = generator.createActivityTaskFailed(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskFailed,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createActivityTaskFailed({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskFailed,
          params: {},
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });

  describe('createActivityTaskTimedOut', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          timeoutType: 'timeout type test',
          scheduledEventId: 11111,
          startedEventId: 22222,
          details: 'test details',
        };
        const historyEvent = generator.createActivityTaskTimedOut(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskTimedOut,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createActivityTaskTimedOut({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskTimedOut,
          params: {},
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });

  describe('createActivityTaskCanceled', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          details: 'details test',
          scheduledEventId: 11111,
          startedEventId: 222222,
          latestCancelRequestedEventId: 33333,
        };
        const historyEvent = generator.createActivityTaskCanceled(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskCanceled,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createActivityTaskCanceled({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskCanceled,
          params: {},
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });


  describe('createActivityTaskCancelRequested', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected = {
          decisionTaskCompletedEventId: 11111,
          activityId: 'test activity id',
        };
        const historyEvent = generator.createActivityTaskCancelRequested(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskCancelRequested,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createActivityTaskCancelRequested({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.ActivityTaskCancelRequested,
          params: {
            activityId: generator.activityId,
          },
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });


  describe('createRequestCancelActivityTaskFailed', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
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
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createRequestCancelActivityTaskFailed({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.RequestCancelActivityTaskFailed,
          params: {
            activityId: generator.activityId,
          },
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });


  describe('createWorkflowExecutionStarted', () => {
    context('with parameters', () => {
      it('should create HistoryEvent with the given parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const expected: Partial<WorkflowExecutionStartedEventAttributes> = {
          input: 'test input',
          taskList: { name: 'test-task-list' },
        };
        const historyEvent = generator.createWorkflowExecutionStarted(expected);
        expectHistoryEvent(historyEvent, {
          eventType: EventType.WorkflowExecutionStarted,
          params: expected,
          eventId: generator.currentEventId - 1,
        });
      });
    });

    context('without params', () => {
      it('should create history event with default parameters', () => {
        const generator = new ActivityHistoryGenerator();
        const historyEvent = generator.createWorkflowExecutionStarted({});
        expectHistoryEvent(historyEvent, {
          eventType: EventType.WorkflowExecutionStarted,
          params: {
            childPolicy: 'TERMINATE',
            taskList: {
              name: 'default',
            },
            workflowType: {
              name: 'test-workflow',
              version: '1',
            },
          },
          eventId: generator.currentEventId - 1,
        });
      });
    });
  });

  describe('createActivityList', () => {
    context('with default parameters', () => {
      it('should generate completed Workflow history', () => {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
          EventType.ActivityTaskScheduled,
          EventType.ActivityTaskStarted,
          EventType.ActivityTaskCompleted,
        ]);
        expectHistoryEvent(list[0], {
          eventType: EventType.ActivityTaskScheduled,
          params: {
            activityId: historyGenerator.activityId,
          },
          eventId: 1,
        });
        expectHistoryEvent(list[1], {
          eventType: EventType.ActivityTaskStarted,
          params: {
            scheduledEventId: 1,
          },
          eventId: 2,
        });
        expectHistoryEvent(list[2], {
          eventType: EventType.ActivityTaskCompleted,
          params: {
            scheduledEventId: 1,
            startedEventId: 2,
          },
          eventId: 3,
        });
      });

      it('should generate a failed Workflow history', () => {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
          EventType.ActivityTaskScheduled,
          EventType.ActivityTaskStarted,
          EventType.ActivityTaskFailed,
        ]);
        expectHistoryEvent(list[0], {
          eventType: EventType.ActivityTaskScheduled,
          params: {
            activityId: historyGenerator.activityId,
          },
          eventId: 1,
        });
        expectHistoryEvent(list[1], {
          eventType: EventType.ActivityTaskStarted,
          params: {
            scheduledEventId: 1,
          },
          eventId: 2,
        });
        expectHistoryEvent(list[2], {
          eventType: EventType.ActivityTaskFailed,
          params: {
            scheduledEventId: 1,
            startedEventId: 2,
          },
          eventId: 3,
        });
      });
      it('should generate a canceled Workflow history', () => {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
          EventType.ActivityTaskScheduled,
          EventType.ActivityTaskStarted,
          EventType.ActivityTaskCancelRequested,
          EventType.ActivityTaskCanceled,

        ]);
        expectHistoryEvent(list[0], {
          eventType: EventType.ActivityTaskScheduled,
          params: {
            activityId: historyGenerator.activityId,
          },
          eventId: 1,
        });
        expectHistoryEvent(list[1], {
          eventType: EventType.ActivityTaskStarted,
          params: {
            scheduledEventId: 1,
          },
          eventId: 2,
        });
        expectHistoryEvent(list[2], {
          eventType: EventType.ActivityTaskCancelRequested,
          params: {
            activityId: historyGenerator.activityId,
          },
          eventId: 3,
        });
        expectHistoryEvent(list[3], {
          eventType: EventType.ActivityTaskCanceled,
          params: {
            scheduledEventId: 1,
            startedEventId: 2,
            latestCancelRequestedEventId: 3,
          },
          eventId: 4,
        });
      });

      it('should generate a timed out activity Workflow history', () => {
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList([
          EventType.ActivityTaskScheduled,
          EventType.ActivityTaskStarted,
          EventType.ActivityTaskTimedOut,
        ]);
        expectHistoryEvent(list[0], {
          eventType: EventType.ActivityTaskScheduled,
          params: {
            activityId: historyGenerator.activityId,
          },
          eventId: 1,
        });
        expectHistoryEvent(list[1], {
          eventType: EventType.ActivityTaskStarted,
          params: {
            scheduledEventId: 1,
          },
          eventId: 2,
        });
        expectHistoryEvent(list[2], {
          eventType: EventType.ActivityTaskTimedOut,
          params: {
            scheduledEventId: 1,
            startedEventId: 2,
            timeoutType: 'SCHEDULE_TO_START',
          },
          eventId: 3,
        });
      });

    });

    describe('createActivityList', () => {

      it('should generate a coherent Workflow history', () => {
        const historyGenerator = new ActivityHistoryGenerator();
        historyGenerator.seek(10);
        const list = historyGenerator.createActivityList([
          EventType.ActivityTaskScheduled,
          EventType.ActivityTaskStarted,
          EventType.ActivityTaskCompleted,
        ]);
        const eventIds = list.map(event => event.eventId);
        expect(eventIds).to.be.eql([10, 11, 12]);
      });


      context('with given parameters', () => {
        let historyGenerator: ActivityHistoryGenerator;
        let fistEventId: number;
        beforeEach(() => {
          historyGenerator = new ActivityHistoryGenerator();
          fistEventId = 100;
          historyGenerator.seek(fistEventId);
        });

        it('should generate a completed Workflow history', () => {
          const params = [SCHEDULED_PARAMS, STARTED_PARAMS, COMPLETED_PARAMS];
          const list = historyGenerator.createActivityList(
            [
              EventType.ActivityTaskScheduled,
              EventType.ActivityTaskStarted,
              EventType.ActivityTaskCompleted,
            ],
            params);
          expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: SCHEDULED_PARAMS,
            eventId: fistEventId,
          });
          expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: STARTED_PARAMS,
            eventId: fistEventId + 1,
          });
          expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskCompleted,
            params: COMPLETED_PARAMS,
            eventId: fistEventId + 2,
          });
        });

        it('should generate a failed Workflow history', () => {
          const params = [SCHEDULED_PARAMS, STARTED_PARAMS, FAILED_PARAMS];
          const list = historyGenerator.createActivityList(
            [
              EventType.ActivityTaskScheduled,
              EventType.ActivityTaskStarted,
              EventType.ActivityTaskFailed,
            ],
            params);
          expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: SCHEDULED_PARAMS,
            eventId: fistEventId,
          });
          expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: merge(STARTED_PARAMS, {
              scheduledEventId: fistEventId,
            }),
            eventId: fistEventId + 1,
          });
          expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskFailed,
            params: merge(FAILED_PARAMS, {
              scheduledEventId: fistEventId,
              startedEventId: fistEventId + 1,
            }),
            eventId: fistEventId + 2,
          });
        });

        it('should generate a canceled Workflow history', () => {
          const params = [SCHEDULED_PARAMS, STARTED_PARAMS, REQUEST_CANCELLED_PARAMS, CANCELLED_PARAMS];
          const list = historyGenerator.createActivityList(
            [
              EventType.ActivityTaskScheduled,
              EventType.ActivityTaskStarted,
              EventType.ActivityTaskCancelRequested,
              EventType.ActivityTaskCanceled,
            ],
            params);
          expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: SCHEDULED_PARAMS,
            eventId: fistEventId,
          });
          expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: STARTED_PARAMS,
            eventId: fistEventId + 1,
          });
          expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskCancelRequested,
            params: REQUEST_CANCELLED_PARAMS,
            eventId: fistEventId + 2,
          });
          expectHistoryEvent(list[3], {
            eventType: EventType.ActivityTaskCanceled,
            params: CANCELLED_PARAMS,
            eventId: fistEventId + 3,
          });
        });

        it('should generate a timed out activity Workflow history', () => {
          const params = [SCHEDULED_PARAMS, STARTED_PARAMS, TIMEOUT_PARAMS];
          const list = historyGenerator.createActivityList(
            [
              EventType.ActivityTaskScheduled,
              EventType.ActivityTaskStarted,
              EventType.ActivityTaskTimedOut,
            ],
            params);
          expectHistoryEvent(list[0], {
            eventType: EventType.ActivityTaskScheduled,
            params: SCHEDULED_PARAMS,
            eventId: fistEventId,
          });
          expectHistoryEvent(list[1], {
            eventType: EventType.ActivityTaskStarted,
            params: STARTED_PARAMS,
            eventId: fistEventId + 1,
          });
          expectHistoryEvent(list[2], {
            eventType: EventType.ActivityTaskTimedOut,
            params: TIMEOUT_PARAMS,
            eventId: fistEventId + 2,
          });
        });
      });
    });
  });

  describe('generateList', () => {
    it('should generate a coherent Workflow history', () => {
      const events = ActivityHistoryGenerator.generateList([
        COMPLETED_TRANSITION,
        TIMEOUTED_TRANSITION,
        COMPLETED_TRANSITION,
        FAILED_TRANSITION,
        COMPLETED_TRANSITION,
        CANCELLED_TRANSITION,
        FAILED_TRANSITION,
        CANCELLED_TRANSITION,
        TIMEOUTED_TRANSITION,
      ]);

      const expectedEventIds: number[] = [];
      for (let i = 1; i <= events.length; i++) {
        expectedEventIds.push(i);
      }
      const eventIds = events.map(event => event.eventId);
      expect(eventIds).to.be.eql(expectedEventIds);
    });
  });
});
