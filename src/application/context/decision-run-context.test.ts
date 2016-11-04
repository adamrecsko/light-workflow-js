import {BaseDecisionRunContext} from "./decision-run-context";
import {expect} from "chai";
import {ActivityHistoryGenerator} from "../../testing/helpers/workflow-history-generator";
import {ScheduleActivityTaskDecisionAttributes} from "../../aws/aws.types";
import {ActivityDecisionStateMachine} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
import {AbstractHistoryEventStateMachine} from "../../state-machines/history-event-state-machines/abstract-history-event-state-machine";
import {ActivityDecisionStates} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
import {expectActivityStateMachine} from "../../testing/helpers/expectation-helpers";
import {
    COMPLETED_TRANSITION,
    FAILED_TRANSITION,
    CANCEL_FAILED_TRANSITION,
    CANCELLED_TRANSITION,
    TIMEOUTED_TRANSITION
} from "../../testing/test-data/normal-transitions";
import {SCHEDULED_PARAMS, STARTED_PARAMS, COMPLETED_PARAMS, FAILED_PARAMS} from "../../testing/test-data/event-params";


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
            const stateMachine = runContext.getOrCreateActivityStateMachine(testAttribs);
            expect(stateMachine).to.instanceOf(ActivityDecisionStateMachine);
        });
        context('if activityId registered', ()=> {
            it('should not create new ActivityDecisionStateMachine', ()=> {
                const testAttribs = createNewActivityDecision();
                const runContext = new BaseDecisionRunContext();
                const stateMachine = runContext.getOrCreateActivityStateMachine(testAttribs);
                const stateMachine2 = runContext.getOrCreateActivityStateMachine(testAttribs);
                expect(stateMachine).to.eq(stateMachine2);
            });
        });
        context('if activityId not registered', ()=> {
            it('should create new ActivityDecisionStateMachine', ()=> {
                const runContext = new BaseDecisionRunContext();
                const dec1 = createNewActivityDecision('activity-1');
                const dec2 = createNewActivityDecision('activity-2');
                const stateMachine = runContext.getOrCreateActivityStateMachine(dec1);
                const stateMachine2 = runContext.getOrCreateActivityStateMachine(dec2);
                expect(stateMachine).to.not.eq(stateMachine2);
            });
        });
    });

    describe('getStateMachines', ()=> {
        it('should return an array of state machines', ()=> {
            const runContext = new BaseDecisionRunContext();
            const dec1 = createNewActivityDecision('activity-1');
            const dec2 = createNewActivityDecision('activity-2');
            const stateMachine = runContext.getOrCreateActivityStateMachine(dec1);
            const stateMachine2 = runContext.getOrCreateActivityStateMachine(dec2);
            expect(runContext.getStateMachines()).to.eql([stateMachine, stateMachine2]);
        });
    });

    describe('processEventList', ()=> {

        context('normal completed transition', ()=> {
            it('should update state machines', ()=> {
                const runContext = new BaseDecisionRunContext();
                const historyGenerator = new ActivityHistoryGenerator();
                const eventList = historyGenerator.createActivityList(COMPLETED_TRANSITION);

                const completedEvent = eventList[2];
                runContext.processEventList(eventList);
                const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
                expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[0], {
                    result: completedEvent.activityTaskCompletedEventAttributes.result
                }, ActivityDecisionStates.Completed);
            });
        });

        context('normal failed transition', ()=> {
            it('should update state machines', ()=> {
                const runContext = new BaseDecisionRunContext();
                const historyGenerator = new ActivityHistoryGenerator();
                const eventList = historyGenerator.createActivityList(FAILED_TRANSITION);
                runContext.processEventList(eventList);
                const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
                expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionStates.Failed);
            });
        });


        context('normal timeouted transition', ()=> {
            it('should update state machines', ()=> {
                const runContext = new BaseDecisionRunContext();
                const historyGenerator = new ActivityHistoryGenerator();
                const eventList = historyGenerator.createActivityList(TIMEOUTED_TRANSITION);
                runContext.processEventList(eventList);
                const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
                expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionStates.TimedOut);
            });
        });

        context('normal cancelled transition', ()=> {
            it('should update state machines', ()=> {
                const runContext = new BaseDecisionRunContext();
                const historyGenerator = new ActivityHistoryGenerator();
                const eventList = historyGenerator.createActivityList(CANCELLED_TRANSITION);
                runContext.processEventList(eventList);
                const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
                expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionStates.Canceled);
            });
        });

        context('normal cancel failed transition', ()=> {
            it('should update state machines', ()=> {
                const runContext = new BaseDecisionRunContext();
                const historyGenerator = new ActivityHistoryGenerator();
                const eventList = historyGenerator.createActivityList(CANCEL_FAILED_TRANSITION);
                runContext.processEventList(eventList);
                const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
                expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[0], null, ActivityDecisionStates.RequestCancelFailed);
            });
        });


        it('should update state machines with failed transition', ()=> {
            const runContext = new BaseDecisionRunContext();
            const list = ActivityHistoryGenerator.generateList([
                FAILED_TRANSITION,
                FAILED_TRANSITION
            ]);

            runContext.processEventList(list);
            const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
            expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[0], {
                reason: list[2].activityTaskFailedEventAttributes.reason,
                details: list[2].activityTaskFailedEventAttributes.details
            }, ActivityDecisionStates.Failed);

            expectActivityStateMachine(<ActivityDecisionStateMachine>stateMachines[1], {
                reason: list[5].activityTaskFailedEventAttributes.reason,
                details: list[5].activityTaskFailedEventAttributes.details
            }, ActivityDecisionStates.Failed);
        });

        it('should create unique state machines for each activity', ()=> {
            const runContext = new BaseDecisionRunContext();
            const list = ActivityHistoryGenerator.generateList([
                COMPLETED_TRANSITION,
                FAILED_TRANSITION,
                CANCEL_FAILED_TRANSITION,
                CANCELLED_TRANSITION,
                TIMEOUTED_TRANSITION,
            ]);

            runContext.processEventList(list);
            const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
            expect(stateMachines.length).to.eq(5);
        });

        it('should not create new activity state machines', ()=> {
            const runContext = new BaseDecisionRunContext();
            const list = ActivityHistoryGenerator.generateList([
                COMPLETED_TRANSITION,
                FAILED_TRANSITION,
                CANCEL_FAILED_TRANSITION,
                CANCELLED_TRANSITION,
                TIMEOUTED_TRANSITION
            ]);

            runContext.processEventList(list);
            runContext.processEventList(list);
            runContext.processEventList(list);

            const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
            expect(stateMachines.length).to.eq(5);
        });

        it('should notify stateMachines about change', ()=> {
            const runContext = new BaseDecisionRunContext();
            const list = ActivityHistoryGenerator.generateList([
                COMPLETED_TRANSITION
            ]);
            runContext.processEventList(list.slice(0, 1));
            const stateMachines: AbstractHistoryEventStateMachine<ActivityDecisionStates>[] = runContext.getStateMachines();
            const stateMachine = stateMachines[0];

            let status: ActivityDecisionStates;
            stateMachine.onChange.subscribe((s: ActivityDecisionStates)=> {
                status = s;
            });
            runContext.processEventList(list);
            expect(status).to.eq(ActivityDecisionStates.Completed);
        });

        it('should handle transition to completed activity state machine', ()=> {
            const parameters: any[][] = [
                [
                    SCHEDULED_PARAMS,
                    STARTED_PARAMS,
                    COMPLETED_PARAMS
                ]
            ];
            const runContext = new BaseDecisionRunContext();
            const list = ActivityHistoryGenerator.generateList([
                COMPLETED_TRANSITION
            ], parameters);

            runContext.processEventList(list);
            const stateMachines: ActivityDecisionStateMachine[] = <ActivityDecisionStateMachine[]>runContext.getStateMachines();

            expectActivityStateMachine(stateMachines[0], {
                control: SCHEDULED_PARAMS.control,
                input: SCHEDULED_PARAMS.input,
                result: COMPLETED_PARAMS.result,
                identity: STARTED_PARAMS.identity
            }, ActivityDecisionStates.Completed);
        });

        it('should handle transition to failed activity state machine', ()=> {
            const parameters: any[][] = [
                [
                    SCHEDULED_PARAMS,
                    STARTED_PARAMS,
                    FAILED_PARAMS
                ]
            ];
            const runContext = new BaseDecisionRunContext();
            const list = ActivityHistoryGenerator.generateList([
                FAILED_TRANSITION
            ], parameters);

            runContext.processEventList(list);
            const stateMachines: ActivityDecisionStateMachine[] = <ActivityDecisionStateMachine[]>runContext.getStateMachines();

            expectActivityStateMachine(stateMachines[0], {
                control: SCHEDULED_PARAMS.control,
                input: SCHEDULED_PARAMS.input,
                reason: FAILED_PARAMS.reason,
                details: FAILED_PARAMS.details,
                identity: STARTED_PARAMS.identity
            }, ActivityDecisionStates.Failed);
        });
    });

    describe('getActivityDecisionStateMachine', ()=> {
        context('if activity state machine already created', ()=> {

            it('should create activity state machine', ()=> {
                const runContext = new BaseDecisionRunContext();
                const attributes = {
                    activityId: 'test actvity id',
                    input: 'this is an input'
                };
                const stateMachine = runContext.getOrCreateActivityStateMachine(attributes);
                expect(stateMachine).to.be.instanceOf(ActivityDecisionStateMachine);
            });
            it('should store activity state machine', ()=> {
                const runContext = new BaseDecisionRunContext();
                const attributes = {
                    activityId: 'test actvity id',
                    input: 'this is an input'
                };
                const stateMachine = runContext.getOrCreateActivityStateMachine(attributes);

                const machines = runContext.getStateMachines();
                expect(machines[0]).to.be.eq(stateMachine);

            });


        });

        context('if activity state machine not created', ()=> {
            it('should not create new activity state machine', ()=> {
                const runContext = new BaseDecisionRunContext();
                const attributes = {
                    activityId: 'test actvity id',
                    input: 'this is an input'
                };
                const stateMachine = runContext.getOrCreateActivityStateMachine(attributes);
                const stateMachine2 = runContext.getOrCreateActivityStateMachine(attributes);
                expect(stateMachine).to.be.eq(stateMachine2);
            });

            it('should gives back stored activity state machine', ()=> {
                const runContext = new BaseDecisionRunContext();
                const historyGenerator = new ActivityHistoryGenerator();
                runContext.processEventList(historyGenerator.createActivityList(
                    COMPLETED_TRANSITION,
                    [SCHEDULED_PARAMS, STARTED_PARAMS, COMPLETED_PARAMS]
                ));
                const attributes = {
                    activityId: SCHEDULED_PARAMS.activityId,
                };
                const stateMachine = runContext.getOrCreateActivityStateMachine(attributes);
                expect(stateMachine.result).to.eq(COMPLETED_PARAMS.result);
            });

        });
    });

});