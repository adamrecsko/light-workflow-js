import {
    InvalidStateTransitionException
} from "./state-machine";
import {expect} from "chai";
import {BaseStateMachine} from "./base-state-machine";
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
