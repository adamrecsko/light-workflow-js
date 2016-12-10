import {StateMachine, TransitionTable, InvalidStateTransitionException} from "./state-machine";

export class BaseStateMachine<T> implements StateMachine<T> {
    public stateHistory: T[] = [];
    private _currentState: T;


    constructor(private transitionTable: TransitionTable<T>, initialState: T) {
        this.stateHistory.push(initialState);
        this._currentState = initialState;
    }


    public get currentState(): T {
        return this._currentState;
    }

    public set currentState(value: T) {
        this.goTo(value);
    }

    public goTo(state: T): void {
        if (this.isValidTransition(state)) {
            this._currentState = state;
            this.stateHistory.push(this._currentState);
        } else {
            throw new InvalidStateTransitionException(
                `Transition table is not allow change: ${this._currentState} -> ${state}`
            );
        }
    }

    private isValidTransition(state: T): boolean {
        const stateSet = new Set<T>();
        this.transitionTable.forEach((entry)=> {
            if (entry[0] === this._currentState) {
                stateSet.add(entry[1]);
            }
        });
        return stateSet.has(state);
    }
}

