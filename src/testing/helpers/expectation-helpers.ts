import * as chai from 'chai';
chai.use(require('chai-shallow-deep-equal'));
import {expect} from "chai";
import {ActivityDecisionStates} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
import {ActivityDecisionStateMachine} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";


export function expectActivityState(current: ActivityDecisionStates, expected: ActivityDecisionStates): void {
    expect(current)
        .to.eq(expected, `Current state ( ${ActivityDecisionStates[current]} ) not equal expected ( ${ActivityDecisionStates[expected]} )`);
}


export function expectActivityStateMachine(sm: ActivityDecisionStateMachine,
                                           properties: any,
                                           currentState: ActivityDecisionStates) {
    if (properties !== null)
        (<any>expect(sm).to).shallowDeepEqual(properties);
    expectActivityState(sm.currentState, currentState);
}