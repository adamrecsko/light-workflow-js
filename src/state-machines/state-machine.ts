import Base = Mocha.reporters.Base;
import {Observable, BehaviorSubject, Subject} from "rxjs";
export interface StateMachine<T> {
    goTo(state: T): void;
    currentState: T;
}

export type TransitionTable<T> = [[T,T]];


export class InvalidStateTransitionException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class BaseStateMachine<T> implements StateMachine<T> {
    public stateHistory: T[] = [];
    private _currentState: T;

    public get currentState(): T {
        return this._currentState;
    }

    public set currentState(value: T) {
        this.goTo(value);
    }

    constructor(private transitionTable: TransitionTable<T>, initialState: T) {
        this.stateHistory.push(initialState);
        this._currentState = initialState;
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

    goTo(state: T): void {
        if (this.isValidTransition(state)) {
            this._currentState = state;
            this.stateHistory.push(this._currentState);
        } else {
            throw new InvalidStateTransitionException(
                `Transition table is not allow change: ${this._currentState} -> ${state}`
            );
        }
    }
}


export class ObservableStateMachine<T> extends BaseStateMachine<T> {
    public stateObservable: Subject<T>;

    constructor(transitionTable: TransitionTable<T>, currentState: T) {
        super(transitionTable, currentState);
        this.stateObservable = new BehaviorSubject<T>(currentState);
    }

    goTo(state: T): void {
        super.goTo(state);
        this.stateObservable.next(state);
    }
}
