import {ActivityDecisionStateMachine, ActivityDecisionStates} from "./activity-decision";
import {ActivityHistoryGenerator, expectStateMachine, expectState} from "../testing/helpers/workflow-history-generator";
import {expect} from "chai";
import {ScheduleActivityTaskDecisionAttributes} from "../aws/aws.types";


describe('ActivityDecisionStateMachine', ()=> {
    let stateMachine: ActivityDecisionStateMachine;
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
        stateMachine = new ActivityDecisionStateMachine(startParams, ActivityDecisionStates.Created);
        historyGenerator = new ActivityHistoryGenerator();
    });

    it('should initialized with start params', ()=> {
        expectState(stateMachine.currentState, ActivityDecisionStates.Created);
        expect(stateMachine.startParams).to.eq(startParams);
    });

    it('should handle ActivityTaskScheduled event', ()=> {
        const activityId = '1';
        const event = historyGenerator.createActivityScheduledEvent(activityId);
        const params = event.activityTaskScheduledEventAttributes;
        stateMachine.processHistoryEvent(event);

        expectStateMachine(stateMachine,
            {
                control: params.control,
                input: params.input
            },
            ActivityDecisionStates.Scheduled);
    });
    it('should handle ScheduleActivityTaskFailed event', ()=> {
        const event = historyGenerator.createScheduleActivityTaskFailed('1001');
        const params = event.scheduleActivityTaskFailedEventAttributes;
        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            {
                cause: params.cause
            },
            ActivityDecisionStates.ScheduleFailed
        );
    });
    it('should handle ActivityTaskStarted event', ()=> {
        const event = historyGenerator.createActivityTaskStarted();
        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            null,
            ActivityDecisionStates.Started
        );
    });
    it('should handle ActivityTaskCompleted event', ()=> {
        const event = historyGenerator.createActivityTaskCompleted();
        const params = event.activityTaskCompletedEventAttributes;
        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            {
                result: params.result
            },
            ActivityDecisionStates.Completed
        );
    });
    it('should handle ActivityTaskFailed event', ()=> {
        const event = historyGenerator.createActivityTaskFailed();
        const params = event.activityTaskFailedEventAttributes;

        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            {
                details: params.details,
                reason: params.reason
            },
            ActivityDecisionStates.Failed
        );
    });
    it('should handle ActivityTaskTimedOut event', ()=> {
        const event = historyGenerator.createActivityTaskTimedOut();
        const params = event.activityTaskTimedOutEventAttributes;

        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            {
                details: params.details,
                timeoutType: params.timeoutType
            },
            ActivityDecisionStates.TimedOut
        );
    });
    it('should handle ActivityTaskCanceled event', ()=> {
        const event = historyGenerator.createActivityTaskCanceled();
        const params = event.activityTaskCanceledEventAttributes;

        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            {
                details: params.details
            },
            ActivityDecisionStates.Canceled
        );
    });
    it('should handle ActivityTaskCancelRequested event', ()=> {
        const activityId = '1';
        const event = historyGenerator.createActivityTaskCancelRequested(activityId);
        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            null,
            ActivityDecisionStates.CancelRequested
        );
    });
    it('should handle RequestCancelActivityTaskFailed event', ()=> {
        const activityId = '1';
        const event = historyGenerator.createRequestCancelActivityTaskFailed(activityId);
        const params = event.requestCancelActivityTaskFailedEventAttributes;
        stateMachine.processHistoryEvent(event);
        expectStateMachine(stateMachine,
            {
                cause: params.cause
            },
            ActivityDecisionStates.RequestCancelFailed
        );
    });

    it('should it should set state to sending', ()=> {
        stateMachine.setStateToSending();
        expectState(stateMachine.currentState, ActivityDecisionStates.Sending);
    });

    it('should it should set state to sent', ()=> {
        stateMachine.setStateToSending();
        stateMachine.setStateToSent();
        expectState(stateMachine.currentState, ActivityDecisionStates.Sent);
    });


    context('if already in the state', ()=> {
        it('should not process event', ()=> {
            const activityId = '1';
            const event = historyGenerator.createRequestCancelActivityTaskFailed(activityId);
            const params = event.requestCancelActivityTaskFailedEventAttributes;
            stateMachine.processHistoryEvent(event);
            stateMachine.processHistoryEvent(event);
            expectStateMachine(stateMachine,
                {
                    cause: params.cause
                },
                ActivityDecisionStates.RequestCancelFailed
            );
        });
    })

});