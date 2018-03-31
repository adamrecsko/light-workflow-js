import { BaseDecisionRunContext } from './decision-run-context';
import { expect } from 'chai';
import { ActivityHistoryGenerator } from '../../testing/helpers/activity-history-generator';
import { DecisionTask, HistoryEvent, ScheduleActivityTaskDecisionAttributes } from '../../aws/aws.types';
import { BaseActivityDecisionStateMachine } from './state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { ActivityDecisionState } from './state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states';
import { expectActivityStateMachine } from '../../testing/helpers/expectation-helpers';
import {
  COMPLETED_TRANSITION,
  FAILED_TRANSITION,
  CANCEL_FAILED_TRANSITION,
  CANCELLED_TRANSITION,
  TIMEOUTED_TRANSITION,
} from '../../testing/test-data/normal-transitions';
import {
  SCHEDULED_PARAMS,
  STARTED_PARAMS,
  COMPLETED_PARAMS,
  FAILED_PARAMS,
} from '../../testing/test-data/event-params';
import { HistoryEventProcessor } from './state-machines/history-event-state-machines/history-event-state-machine';


function createNewActivityDecision(activityId?: string): ScheduleActivityTaskDecisionAttributes {
  return {
    activityType: {
      name: 'test',
      version: '1',
    },
    activityId: activityId || 'activity-id-1',
    input: 'input string',
  };
}

function createDecisionTask(eventList: HistoryEvent[]): DecisionTask {
  return {
    previousStartedEventId: 1,
    startedEventId: 0,
    taskToken: 'test-token',
    workflowExecution: {
      runId: 'runId',
      workflowId: 'workflowId',
    },
    workflowType: {
      name: 'workflowName',
      version: '1',
    },
    events: eventList,
  };
}

describe('BaseDecisionContext', () => {
  describe('getActivityDecisionStateMachine', () => {
    it('should return ActivityDecisionStateMachine', () => {
      const runContext = new BaseDecisionRunContext();
      const testAttribs = createNewActivityDecision();
      const stateMachine = runContext.scheduleActivity(testAttribs);
      expect(stateMachine).to.instanceOf(BaseActivityDecisionStateMachine);
    });
    context('if activityId registered', () => {
      it('should not create new ActivityDecisionStateMachine', () => {
        const testAttribs = createNewActivityDecision();
        const runContext = new BaseDecisionRunContext();
        const stateMachine = runContext.scheduleActivity(testAttribs);
        const stateMachine2 = runContext.scheduleActivity(testAttribs);
        expect(stateMachine).to.eq(stateMachine2);
      });
    });
    context('if activityId not registered', () => {
      it('should create new ActivityDecisionStateMachine', () => {
        const runContext = new BaseDecisionRunContext();
        const dec1 = createNewActivityDecision('activity-1');
        const dec2 = createNewActivityDecision('activity-2');
        const stateMachine = runContext.scheduleActivity(dec1);
        const stateMachine2 = runContext.scheduleActivity(dec2);
        expect(stateMachine).to.not.eq(stateMachine2);
      });
    });
  });

  describe('getStateMachines', () => {
    it('should return an array of state machines', () => {
      const runContext = new BaseDecisionRunContext();
      const dec1 = createNewActivityDecision('activity-1');
      const dec2 = createNewActivityDecision('activity-2');
      const stateMachine = runContext.scheduleActivity(dec1);
      const stateMachine2 = runContext.scheduleActivity(dec2);
      expect(runContext.getStateMachines()).to.eql([stateMachine, stateMachine2]);
    });
  });

  describe('processEventList', () => {

    context('normal completed transition', () => {
      it('should update state machines', () => {
        const runContext = new BaseDecisionRunContext();
        const historyGenerator = new ActivityHistoryGenerator();
        const eventList = historyGenerator.createActivityList(COMPLETED_TRANSITION);

        const completedEvent = eventList[2];
        runContext.processEventList(createDecisionTask(eventList));
        const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
        expectActivityStateMachine(
          <BaseActivityDecisionStateMachine>stateMachines[0], {
            result: completedEvent.activityTaskCompletedEventAttributes.result,
          },
          ActivityDecisionState.Completed);
      });
    });

    context('normal failed transition', () => {
      it('should update state machines', () => {
        const runContext = new BaseDecisionRunContext();
        const historyGenerator = new ActivityHistoryGenerator();
        const eventList = historyGenerator.createActivityList(FAILED_TRANSITION);
        runContext.processEventList(createDecisionTask(eventList));
        const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
        expectActivityStateMachine(<BaseActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionState.Failed);
      });
    });


    context('normal timeouted transition', () => {
      it('should update state machines', () => {
        const runContext = new BaseDecisionRunContext();
        const historyGenerator = new ActivityHistoryGenerator();
        const eventList = historyGenerator.createActivityList(TIMEOUTED_TRANSITION);
        runContext.processEventList(createDecisionTask(eventList));
        const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
        expectActivityStateMachine(<BaseActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionState.Timeout);
      });
    });

    context('normal cancelled transition', () => {
      it('should update state machines', () => {
        const runContext = new BaseDecisionRunContext();
        const historyGenerator = new ActivityHistoryGenerator();
        const eventList = historyGenerator.createActivityList(CANCELLED_TRANSITION);
        runContext.processEventList(createDecisionTask(eventList));
        const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
        expectActivityStateMachine(<BaseActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionState.Canceled);
      });
    });

    context('normal cancel failed transition', () => {
      it('should update state machines', () => {
        const runContext = new BaseDecisionRunContext();
        const historyGenerator = new ActivityHistoryGenerator();
        const eventList = historyGenerator.createActivityList(CANCEL_FAILED_TRANSITION);
        runContext.processEventList(createDecisionTask(eventList));
        const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
        expectActivityStateMachine(<BaseActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionState.RequestCancelFailed);
      });
    });


    it('should update state machines with failed transition', () => {
      const runContext = new BaseDecisionRunContext();
      const list = ActivityHistoryGenerator.generateList([
        FAILED_TRANSITION,
        FAILED_TRANSITION,
      ]);

      runContext.processEventList(createDecisionTask(list));
      const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
      expectActivityStateMachine(
        <BaseActivityDecisionStateMachine>stateMachines[0],
        {
          reason: list[2].activityTaskFailedEventAttributes.reason,
          details: list[2].activityTaskFailedEventAttributes.details,
        },
        ActivityDecisionState.Failed);

      expectActivityStateMachine(
        <BaseActivityDecisionStateMachine>stateMachines[1],
        {
          reason: list[5].activityTaskFailedEventAttributes.reason,
          details: list[5].activityTaskFailedEventAttributes.details,
        },
        ActivityDecisionState.Failed);
    });

    it('should create unique state machines for each activity', () => {
      const runContext = new BaseDecisionRunContext();
      const list = ActivityHistoryGenerator.generateList([
        COMPLETED_TRANSITION,
        FAILED_TRANSITION,
        CANCEL_FAILED_TRANSITION,
        CANCELLED_TRANSITION,
        TIMEOUTED_TRANSITION,
      ]);

      runContext.processEventList(createDecisionTask(list));
      const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
      expect(stateMachines.length).to.eq(5);
    });

    it('should not create new activity state machines', () => {
      const runContext = new BaseDecisionRunContext();
      const list = ActivityHistoryGenerator.generateList([
        COMPLETED_TRANSITION,
        FAILED_TRANSITION,
        CANCEL_FAILED_TRANSITION,
        CANCELLED_TRANSITION,
        TIMEOUTED_TRANSITION,
      ]);

      runContext.processEventList(createDecisionTask(list));
      runContext.processEventList(createDecisionTask(list));
      runContext.processEventList(createDecisionTask(list));

      const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
      expect(stateMachines.length).to.eq(5);
    });

    it('should notify stateMachines about change', () => {
      const runContext = new BaseDecisionRunContext();
      const list = ActivityHistoryGenerator.generateList([
        COMPLETED_TRANSITION,
      ]);
      runContext.processEventList(createDecisionTask(list.slice(0, 1)));
      const stateMachines: HistoryEventProcessor<any>[] = runContext.getStateMachines();
      const stateMachine = stateMachines[0];

      let status: ActivityDecisionState;
      stateMachine.onChange.subscribe((s: ActivityDecisionState) => {
        status = s;
      });
      runContext.processEventList(createDecisionTask(list));
      expect(status).to.eq(ActivityDecisionState.Completed);
    });

    it('should handle transition to completed activity state machine', () => {
      const parameters: any[][] = [
        [
          SCHEDULED_PARAMS,
          STARTED_PARAMS,
          COMPLETED_PARAMS,
        ],
      ];
      const runContext = new BaseDecisionRunContext();
      const list = ActivityHistoryGenerator.generateList(
        [
          COMPLETED_TRANSITION,
        ],
        parameters);

      runContext.processEventList(createDecisionTask(list));
      const stateMachines: BaseActivityDecisionStateMachine[] = <BaseActivityDecisionStateMachine[]>runContext.getStateMachines();

      expectActivityStateMachine(
        stateMachines[0],
        {
          control: SCHEDULED_PARAMS.control,
          input: SCHEDULED_PARAMS.input,
          result: COMPLETED_PARAMS.result,
          identity: STARTED_PARAMS.identity,
        },
        ActivityDecisionState.Completed);
    });

    it('should handle transition to failed activity state machine', () => {
      const parameters: any[][] = [
        [
          SCHEDULED_PARAMS,
          STARTED_PARAMS,
          FAILED_PARAMS,
        ],
      ];
      const runContext = new BaseDecisionRunContext();
      const list = ActivityHistoryGenerator.generateList(
        [
          FAILED_TRANSITION,
        ],
        parameters);

      runContext.processEventList(createDecisionTask(list));
      const stateMachines: BaseActivityDecisionStateMachine[] = <BaseActivityDecisionStateMachine[]>runContext.getStateMachines();

      expectActivityStateMachine(
        stateMachines[0],
        {
          control: SCHEDULED_PARAMS.control,
          input: SCHEDULED_PARAMS.input,
          reason: FAILED_PARAMS.reason,
          details: FAILED_PARAMS.details,
          identity: STARTED_PARAMS.identity,
        },
        ActivityDecisionState.Failed);
    });
  });

  describe('getActivityDecisionStateMachine', () => {
    context('if activity state machine already created', () => {

      it('should create activity state machine', () => {
        const runContext = new BaseDecisionRunContext();
        const attributes = {
          activityType: {
            name: 'test name',
            version: '123',
          },
          activityId: 'test actvity id',
          input: 'this is an input',
        };
        const stateMachine = runContext.scheduleActivity(attributes);
        expect(stateMachine).to.be.instanceOf(BaseActivityDecisionStateMachine);
      });
      it('should store activity state machine', () => {
        const runContext = new BaseDecisionRunContext();
        const attributes = {
          activityType: {
            name: 'test name',
            version: '123',
          },
          activityId: 'test actvity id',
          input: 'this is an input',
        };
        const stateMachine = runContext.scheduleActivity(attributes);

        const machines = runContext.getStateMachines();
        expect(machines[0]).to.be.eq(stateMachine);

      });


    });

    context('if activity state machine not created', () => {
      it('should not create new activity state machine', () => {
        const runContext = new BaseDecisionRunContext();
        const attributes = {
          activityType: {
            name: 'test name',
            version: '123',
          },
          activityId: 'test actvity id',
          input: 'this is an input',
        };
        const stateMachine = runContext.scheduleActivity(attributes);
        const stateMachine2 = runContext.scheduleActivity(attributes);
        expect(stateMachine).to.be.eq(stateMachine2);
      });

      it('should gives back stored activity state machine', () => {
        const runContext = new BaseDecisionRunContext();
        const historyGenerator = new ActivityHistoryGenerator();
        const list = historyGenerator.createActivityList(
          COMPLETED_TRANSITION,
          [SCHEDULED_PARAMS, STARTED_PARAMS, COMPLETED_PARAMS],
        );
        runContext.processEventList(createDecisionTask(list));
        const attributes = {
          activityType: {
            name: 'test name',
            version: '123',
          },
          activityId: SCHEDULED_PARAMS.activityId,
        };
        const stateMachine = runContext.scheduleActivity(attributes);
        expect(stateMachine.result).to.eq(COMPLETED_PARAMS.result);
      });

    });

  });

  describe('getNextId', () => {
    it('should increase', () => {
      const decisionRunContext = new BaseDecisionRunContext();
      const ids: string[] = [];
      ids.push(decisionRunContext.getNextId());
      ids.push(decisionRunContext.getNextId());
      ids.push(decisionRunContext.getNextId());
      ids.push(decisionRunContext.getNextId());
      ids.push(decisionRunContext.getNextId());
      expect(ids).to.be.eql(['0', '1', '2', '3', '4']);
    });
  });
});
