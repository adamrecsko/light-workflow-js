import Base = Mocha.reporters.Base;
import {BehaviorSubject, Subject} from "rxjs";
export interface StateMachine<T> {
    goTo(state: T): void;
    getCurrentState(): T;
}

export type TransitionTable<T> = [[T,T]];


export class InvalidStateTransitionException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class BaseStateMachine<T> implements StateMachine<T> {
    public stateHistory: T[] = [];

    constructor(private transitionTable: TransitionTable<T>,
                private currentState: T) {
        this.stateHistory.push(currentState);
    }

    private isValidTransition(state: T): boolean {
        const stateSet = new Set<T>();
        this.transitionTable.forEach((entry)=> {
            if (entry[0] === this.currentState) {
                stateSet.add(entry[1]);
            }
        });
        return stateSet.has(state);
    }

    goTo(state: T): void {
        if (this.isValidTransition(state)) {
            this.currentState = state;
            this.stateHistory.push(this.currentState);
        } else {
            throw new InvalidStateTransitionException(
                `Transition table is not allow change: ${this.currentState} -> ${state}`
            );
        }
    }

    public getCurrentState(): T {
        return this.currentState;
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
