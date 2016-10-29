import {BaseDecisionRunContext} from "./decision-run-context";
import {expect} from "chai";
import {
    ActivityDecisionStateMachine, ActivityDecisionStates
} from "../state-machines/activity-decision";
import {ScheduleActivityTaskDecisionAttributes} from "../aws/aws.types";
import Base = Mocha.reporters.Base;
import {ActivityHistoryGenerator, expectStateMachine} from "../testing/helpers/workflow-history-generator";
import {EventType} from "../aws/workflow-history/event-types";
import {AbstractHistoryEventStateMachine} from "../state-machines/state-machine";


function createNewActivityDecision(activityId?: string): ScheduleActivityTaskDecisionAttributes {
    return {
        activityType: {
            name: 'test',
            version: '1'
        },
        activityId: activityId || 'activity-id-1',
        input: 'input string'
    };
}

describe('BaseDecisionContext', ()=> {
    describe('getActivityDecisionStateMachine', ()=> {
        it('should return ActivityDecisionStateMachine', ()=> {
            const runContext = new BaseDecisionRunContext();
            const testAttribs = createNewActivityDecision();
            const stateMachine = runContext.getActivityDecisionStateMachine(testAttribs);
            expect(stateMachine).to.instanceOf(ActivityDecisionStateMachine);
        });
        context('if activityId registered', ()=> {
            it('should not create new ActivityDecisionStateMachine', ()=> {
                const testAttribs = createNewActivityDecision();
                const runContext = new BaseDecisionRunContext();
                const stateMachine = runContext.getActivityDecisionStateMachine(testAttribs);
                const stateMachine2 = runContext.getActivityDecisionStateMachine(testAttribs);
                expect(stateMachine).to.eq(stateMachine2);
            });
        });
        context('if activityId not registered', ()=> {
            it('should create new ActivityDecisionStateMachine', ()=> {
                const runContext = new BaseDecisionRunContext();
                const dec1 = createNewActivityDecision('activity-1');
                const dec2 = createNewActivityDecision('activity-2');
                const stateMachine = runContext.getActivityDecisionStateMachine(dec1);
                const stateMachine2 = runContext.getActivityDecisionStateMachine(dec2);
                expect(stateMachine).to.not.eq(stateMachine2);
            });
        });
    });

    describe('getStateMachines', ()=> {
        it('should return an array of state machines', ()=> {
            const runContext = new BaseDecisionRunContext();
            const dec1 = createNewActivityDecision('activity-1');
            const dec2 = createNewActivityDecision('activity-2');
            const stateMachine = runContext.getActivityDecisionStateMachine(dec1);
            const stateMachine2 = runContext.getActivityDecisionStateMachine(dec2);
            expect(runContext.getStateMachines()).to.eql([stateMachine, stateMachine2]);
        });
    });

    describe('processEventList', ()=> {
        it('should update state machines 1', ()=> {
            const runContext = new BaseDecisionRunContext();
            const historyGenerator = new ActivityHistoryGenerator();
            const eventList = historyGenerator.createActivityList([
                EventType.ActivityTaskScheduled,
                EventType.ActivityTaskStarted,
                EventType.ActivityTaskCompleted
            ]);

            const completedEvent = eventList[2];
            runContext.processEventList(eventList);
            const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
            expectStateMachine(<ActivityDecisionStateMachine>stateMachines[0], {
                result: completedEvent.activityTaskCompletedEventAttributes.result
            }, ActivityDecisionStates.Completed);
        });
        it('should update state machines 2', ()=> {
            const runContext = new BaseDecisionRunContext();
            const historyGenerator = new ActivityHistoryGenerator();
            const eventList = historyGenerator.createActivityList([
                EventType.ActivityTaskScheduled,
                EventType.ActivityTaskStarted,
                EventType.ActivityTaskFailed
            ]);

            const failedEvent = eventList[2];
            runContext.processEventList(eventList);
            const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
            expectStateMachine(<ActivityDecisionStateMachine>stateMachines[0], {
                reason: failedEvent.activityTaskFailedEventAttributes.reason,
                details: failedEvent.activityTaskFailedEventAttributes.details
            }, ActivityDecisionStates.Failed);
        });
    });
});