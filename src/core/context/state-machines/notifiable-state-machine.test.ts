import { BaseNotifiableStateMachine } from './notifiable-state-machine';
import { expect } from 'chai';

describe('NotifiableStateMachine', () => {
  it('should notify about state change', () => {
    const state1 = 'state1';
    const state2 = 'state2';
    const state3 = 'state3';
    const stateMachine = new BaseNotifiableStateMachine<string>(
      [
        [state1, state2],
        [state2, state3],
      ],
      state1);
    let testState: string = null;
    stateMachine.onChange.subscribe((state: string) => {
      testState = state;
    });
    stateMachine.currentState = state2;

    stateMachine.notify();
    expect(testState).to.eq(state2);
  });
});
