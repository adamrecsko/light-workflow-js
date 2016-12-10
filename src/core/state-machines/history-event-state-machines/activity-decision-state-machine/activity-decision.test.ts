import {expect} from "chai";
import {InvalidStateTransitionException} from "../../state-machine";
import {BaseActivityDecisionStateMachine} from "./activity-decision";
import {ActivityDecisionState} from "./activity-decision-states";
import {ActivityHistoryGenerator} from "../../../../testing/helpers/workflow-history-generator";
import {ScheduleActivityTaskDecisionAttributes} from "../../../../aws/aws.types";
import {expectActivityState, expectActivityStateMachine} from "../../../../testing/helpers/expectation-helpers";
import {ActivityTimeoutType} from "../../../../aws/workflow-history/activity-timeout-type";


describe('ActivityDecisionStateMachine', ()=> {
    let historyGenerator: ActivityHistoryGenerator;
    let startParams: ScheduleActivityTaskDecisionAttributes;
    beforeEach(()=> {
        startParams = {
            activityType: {
                name: 'activity',
                version: '1'
            },
            activityId: '3'
        };
        historyGenerator = new ActivityHistoryGenerator();
    });

    it('should initialized with start params', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Created);

        expectActivityState(stateMachine.currentState, ActivityDecisionState.Created);
        expect(stateMachine.startParams).to.eq(startParams);
    });

    it('should handle ActivityTaskScheduled event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Created);

        const activityId = '1';
        const event = historyGenerator.createActivityScheduledEvent(activityId);
        const params = event.activityTaskScheduledEventAttributes;
        stateMachine.processHistoryEvent(event);

        expectActivityStateMachine(stateMachine,
            {
                control: params.control,
                input: params.input
            },
            ActivityDecisionState.Scheduled);
    });
    it('should handle ScheduleActivityTaskFailed event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Sent);

        const event = historyGenerator.createScheduleActivityTaskFailed('1001');
        const params = event.scheduleActivityTaskFailedEventAttributes;
        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {
                cause: params.cause
            },
            ActivityDecisionState.ScheduleFailed
        );
    });
    it('should handle ActivityTaskStarted event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Scheduled);

        const event = historyGenerator.createActivityTaskStarted({});
        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {identity: event.activityTaskStartedEventAttributes.identity},
            ActivityDecisionState.Started
        );
    });
    it('should handle ActivityTaskCompleted event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Started);

        const event = historyGenerator.createActivityTaskCompleted({});
        const params = event.activityTaskCompletedEventAttributes;
        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {
                result: params.result
            },
            ActivityDecisionState.Completed
        );
    });
    it('should handle ActivityTaskFailed event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Started);

        const event = historyGenerator.createActivityTaskFailed({});
        const params = event.activityTaskFailedEventAttributes;

        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {
                details: params.details,
                reason: params.reason
            },
            ActivityDecisionState.Failed
        );
    });
    it('should handle ActivityTaskTimedOut event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Started);

        const event = historyGenerator.createActivityTaskTimedOut({});
        const params = event.activityTaskTimedOutEventAttributes;

        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {
                details: params.details,
                timeoutType: ActivityTimeoutType.fromString(params.timeoutType)
            },
            ActivityDecisionState.Timeout
        );
    });
    it('should handle ActivityTaskCanceled event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.CancelRequested);

        const event = historyGenerator.createActivityTaskCanceled({});
        const params = event.activityTaskCanceledEventAttributes;

        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {
                details: params.details
            },
            ActivityDecisionState.Canceled
        );
    });
    it('should handle ActivityTaskCancelRequested event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Started);

        const activityId = '1';
        const event = historyGenerator.createActivityTaskCancelRequested(activityId);
        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            null,
            ActivityDecisionState.CancelRequested
        );
    });
    it('should handle RequestCancelActivityTaskFailed event', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.CancelRequested);

        const activityId = '1';
        const event = historyGenerator.createRequestCancelActivityTaskFailed(activityId);
        const params = event.requestCancelActivityTaskFailedEventAttributes;
        stateMachine.processHistoryEvent(event);
        expectActivityStateMachine(stateMachine,
            {
                cause: params.cause
            },
            ActivityDecisionState.RequestCancelFailed
        );
    });

    it('should set state to sending', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Created);

        stateMachine.setStateToSending();
        expectActivityState(stateMachine.currentState, ActivityDecisionState.Sending);
    });

    it('should it should set state to sent', ()=> {
        const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.Sending);
        stateMachine.setStateToSent();
        expectActivityState(stateMachine.currentState, ActivityDecisionState.Sent);
    });


    context('if already in the state', ()=> {
        it('should not process event', ()=> {
            const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.CancelRequested);

            const activityId = '1';
            const event = historyGenerator.createRequestCancelActivityTaskFailed(activityId);
            const params = event.requestCancelActivityTaskFailedEventAttributes;
            stateMachine.processHistoryEvent(event);
            stateMachine.processHistoryEvent(event);
            expectActivityStateMachine(stateMachine,
                {
                    cause: params.cause
                },
                ActivityDecisionState.RequestCancelFailed
            );
        });

        it('should throw InvalidStateTransitionException in state conflict', ()=> {
            const stateMachine = new BaseActivityDecisionStateMachine(startParams, ActivityDecisionState.CancelRequested);

            const activityId = '1';
            const event = historyGenerator.createRequestCancelActivityTaskFailed(activityId);
            const event2 = historyGenerator.createRequestCancelActivityTaskFailed(activityId);
            stateMachine.processHistoryEvent(event);
            expect(()=> {
                stateMachine.processHistoryEvent(event2);
            }).to.throw(InvalidStateTransitionException);
        });
    })

});