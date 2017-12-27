import * as chai from 'chai';

chai.use(require('chai-shallow-deep-equal'));
import { ActivityDecisionState } from '../../core/context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states';
import { BaseActivityDecisionStateMachine } from '../../core/context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { HistoryEventStateMachine } from '../../core/context/state-machines/history-event-state-machines/history-event-state-machine';

const expect = chai.expect;

export function expectActivityState(current: ActivityDecisionState, expected: ActivityDecisionState): void {
  expect(current)
    .to.eq(expected, `Current state ( ${ActivityDecisionState[current]} ) not equal expected ( ${ActivityDecisionState[expected]} )`);
}


export function expectActivityStateMachine(sm: HistoryEventStateMachine<any>,
                                           properties: any,
                                           currentState: any) {
  if (properties !== null) {
    (<any>expect(sm).to).shallowDeepEqual(properties);
  }
  expectActivityState(sm.currentState, currentState);
}
