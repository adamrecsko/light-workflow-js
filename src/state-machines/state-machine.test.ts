import {
    BaseStateMachine, InvalidStateTransitionException, ObservableStateMachine,
    NotifyableStateMachine
} from "./state-machine";
import {expect} from "chai";
describe('BaseStateMachine', ()=> {

    context('if valid state change', ()=> {
        it('should change the current state of next state is valid', ()=> {
            const state1 = 'state1';
            const state2 = 'state2';
            const state3 = 'state3';
            const stateMachine = new BaseStateMachine<string>([
                [state1, state2],
                [state2, state3]
            ], state1);
            stateMachine.goTo(state2);
            expect(stateMachine.currentState).to.eq(state2);
        });

        it('should allow multiple possible transition', ()=> {
            const state1 = 'state1';
            const state2 = 'state2';
            const state3 = 'state3';
            const stateMachine = new BaseStateMachine<string>([
                [state1, state2],
                [state1, state3],
                [state2, state3]
            ], state1);
            stateMachine.goTo(state3);
            expect(stateMachine.currentState).to.eq(state3);
        });

    });

    context('if invalid state change', ()=> {
        it('should throw InvalidStateChangeException', ()=> {
            const state1 = 'state1';
            const state2 = 'state2';
            const state3 = 'state3';
            const stateMachine = new BaseStateMachine<string>([
                [state1, state2],
                [state2, state3]
            ], state1);

            expect(()=> {
                stateMachine.goTo(state3);
            }).to.throw(InvalidStateTransitionException);
        });
        it('should throw InvalidStateChangeException when property setter used', ()=> {
            const state1 = 'state1';
            const state2 = 'state2';
            const state3 = 'state3';
            const stateMachine = new BaseStateMachine<string>([
                [state1, state2],
                [state2, state3]
            ], state1);

            expect(()=> {
                stateMachine.currentState = state3;
            }).to.throw(InvalidStateTransitionException);
        });
    });
});

describe('ObservableStateMachine', ()=> {
    it('should notify about state change', ()=> {
        const state1 = 'state1';
        const state2 = 'state2';
        const state3 = 'state3';
        const stateMachine = new ObservableStateMachine<string>([
            [state1, state2],
            [state2, state3]
        ], state1);
        let testState: string = null;
        stateMachine.stateObservable.subscribe((state: string)=> {
            testState = state;
        });
        stateMachine.currentState = state2;
        expect(testState).to.eq(state2);
    });
});
describe('NotifyableStateMachine', ()=> {
    it('should notify about state change', ()=> {
        const state1 = 'state1';
        const state2 = 'state2';
        const state3 = 'state3';
        const stateMachine = new NotifyableStateMachine<string>([
            [state1, state2],
            [state2, state3]
        ], state1);
        let testState: string = null;
        stateMachine.stateObservable.subscribe((state: string)=> {
            testState = state;
        });
        stateMachine.currentState = state2;

        stateMachine.notify();
        expect(testState).to.eq(state2);
    });
});