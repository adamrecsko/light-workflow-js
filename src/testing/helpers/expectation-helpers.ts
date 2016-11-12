import * as chai from 'chai';
chai.use(require('chai-shallow-deep-equal'));
import {expect} from "chai";
import {ActivityDecisionState} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
import {BaseActivityDecisionStateMachine} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";


export function expectActivityState(current: ActivityDecisionState, expected: ActivityDecisionState): void {
    expect(current)
        .to.eq(expected, `Current state ( ${ActivityDecisionState[current]} ) not equal expected ( ${ActivityDecisionState[expected]} )`);
}


export function expectActivityStateMachine(sm: BaseActivityDecisionStateMachine,
                                           properties: any,
                                           currentState: ActivityDecisionState) {
    if (properties !== null)
        (<any>expect(sm).to).shallowDeepEqual(properties);
    expectActivityState(sm.currentState, currentState);
}