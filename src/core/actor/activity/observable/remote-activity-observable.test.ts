import * as sinon from 'sinon';
import { MockActivityDecisionStateMachine } from './mocks/remote-activity-observable-mocks';
import { Observable, TestScheduler } from 'rxjs';
import { ActivityDecisionState } from '../../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states';
import { ActivityTimeoutType } from '../../../../aws/workflow-history/activity-timeout-type';
import { DecisionRunContext } from '../../../context/decision-run-context';
import { ActivityDecisionStateMachine } from '../../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { ChaiTestScheduler } from '../../../../testing/helpers/chai-test-scheduler';
import { RemoteActivityObservable } from './remote-activity-observable';
import {
  FailedException,
  ScheduleFailedException,
  RequestCancelFailedException,
  StartToCloseTimeoutException,
  ScheduleToStartTimeoutException,
  ScheduleToCloseTimeoutException,
  HeartbeatTimeoutException,
} from './remote-activity-observable-exceptions';
import { MockDecisionRunContext } from '../../../../testing/mocks/decision-run-context';
import { Serializer } from '../../../application/serializer';
import { MockSerializer } from '../../../../testing/mocks/serializer';

const activityId = '12345';
const activityType = {
  name: 'type',
  version: '1.0',
};
const scheduleParams = {
  activityId,
  activityType,
};

describe('RemoteActivityObservable', () => {
  let mockDecisionRunContext: DecisionRunContext;
  let mockActivityStateMachine: ActivityDecisionStateMachine;
  let testScheduler: TestScheduler;
  let mockSerializer: Serializer = new MockSerializer();


  beforeEach(() => {
    mockDecisionRunContext = new MockDecisionRunContext();
    mockActivityStateMachine = new MockActivityDecisionStateMachine();
    testScheduler = new ChaiTestScheduler();
    mockSerializer = new MockSerializer();
  });

  it('should create an activity state machine with the schedule parameters during the subscription', () => {
    mockActivityStateMachine.onChange = Observable.never();
    const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
    mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
    const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
    remoteActivityObservable.subscribe();
    sinon.assert.calledWith(mockGetOrCreateActivity, scheduleParams);
  });
  it('should fire next and complete if activity completed', () => {
    const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Completed });
    const result = 'test activity result';
    const serializedResult: any = {
      data: result,
    };
    mockSerializer.parse = sinon.stub().returns(serializedResult);
    mockActivityStateMachine.result = result;
    mockActivityStateMachine.onChange = onChange;
    mockDecisionRunContext.scheduleActivity = sinon.stub().returns(mockActivityStateMachine);
    const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
    testScheduler.expectObservable(remoteActivityObservable).toBe('(a|)', { a: serializedResult });
    testScheduler.flush();
  });
  it('should throw FailedException if activity failed', () => {
    const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Failed });
    const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
    const details = 'failed activity test details';
    const reason = 'failed activity test reason';
    mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
    mockActivityStateMachine.onChange = onChange;
    mockActivityStateMachine.details = details;
    mockActivityStateMachine.reason = reason;
    const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
    testScheduler.expectObservable(remoteActivityObservable).toBe('#', null, new FailedException(mockActivityStateMachine));
    testScheduler.flush();
  });
  it('should throw ScheduleFailedException if schedule failed', () => {
    const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.ScheduleFailed });
    const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
    const cause = 'schedule failed because TEST';
    mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
    mockActivityStateMachine.onChange = onChange;
    mockActivityStateMachine.cause = cause;
    const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
    testScheduler.expectObservable(remoteActivityObservable)
      .toBe('#', null, new ScheduleFailedException(mockActivityStateMachine));
    testScheduler.flush();
  });
  it('should throw RequestCancelFailedException if cancel request failed', () => {
    const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.RequestCancelFailed });
    const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
    const cause = 'cancel failed because TEST';
    mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
    mockActivityStateMachine.onChange = onChange;
    mockActivityStateMachine.cause = cause;
    const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
    testScheduler.expectObservable(remoteActivityObservable)
      .toBe('#', null, new RequestCancelFailedException(mockActivityStateMachine));
    testScheduler.flush();
  });

  it('should complete if activity cancelled', () => {
    const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Canceled });
    mockDecisionRunContext.scheduleActivity = sinon.stub().returns(mockActivityStateMachine);
    mockActivityStateMachine.onChange = onChange;
    const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
    testScheduler.expectObservable(remoteActivityObservable)
      .toBe('|', null);
    testScheduler.flush();
  });
  describe('if activity has timed out', () => {
    context('in case of START_TO_CLOSE timeout', () => {
      it('should throw StartToCloseTimeoutException', () => {
        const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Timeout });
        const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
        const details = 'time out activity test details';
        mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
        mockActivityStateMachine.onChange = onChange;
        mockActivityStateMachine.details = details;
        mockActivityStateMachine.timeoutType = ActivityTimeoutType.START_TO_CLOSE;
        const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
        testScheduler.expectObservable(remoteActivityObservable).toBe('#', null, new StartToCloseTimeoutException(mockActivityStateMachine));
        testScheduler.flush();
      });
    });
    context('in case of SCHEDULE_TO_START timeout', () => {
      it('should throw ScheduleToStartTimeoutException', () => {
        const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Timeout });
        const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
        const details = 'time out activity test details';
        mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
        mockActivityStateMachine.onChange = onChange;
        mockActivityStateMachine.details = details;
        mockActivityStateMachine.timeoutType = ActivityTimeoutType.SCHEDULE_TO_START;
        const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
        testScheduler.expectObservable(remoteActivityObservable).toBe('#', null, new ScheduleToStartTimeoutException(mockActivityStateMachine));
        testScheduler.flush();
      });
    });
    context('in case of SCHEDULE_TO_CLOSE timeout', () => {
      it('should throw ScheduleToCloseTimeoutException', () => {
        const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Timeout });
        const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
        const details = 'time out activity test details';
        mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
        mockActivityStateMachine.onChange = onChange;
        mockActivityStateMachine.details = details;
        mockActivityStateMachine.timeoutType = ActivityTimeoutType.SCHEDULE_TO_CLOSE;
        const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
        testScheduler.expectObservable(remoteActivityObservable).toBe('#', null, new ScheduleToCloseTimeoutException(mockActivityStateMachine));
        testScheduler.flush();
      });
    });

    context('in case of HEARTBEAT timeout', () => {
      it('should throw HeartbeatTimeoutException', () => {
        const onChange: Observable<ActivityDecisionState> = testScheduler.createColdObservable('a', { a: ActivityDecisionState.Timeout });
        const mockGetOrCreateActivity = sinon.stub().returns(mockActivityStateMachine);
        const details = 'time out activity test details';
        mockDecisionRunContext.scheduleActivity = mockGetOrCreateActivity;
        mockActivityStateMachine.onChange = onChange;
        mockActivityStateMachine.details = details;
        mockActivityStateMachine.timeoutType = ActivityTimeoutType.HEARTBEAT;
        const remoteActivityObservable = new RemoteActivityObservable(mockDecisionRunContext, scheduleParams, mockSerializer);
        testScheduler.expectObservable(remoteActivityObservable).toBe('#', null, new HeartbeatTimeoutException(mockActivityStateMachine));
        testScheduler.flush();
      });
    });
  });
});
