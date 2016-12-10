import {BaseStateMachine} from "./base-state-machine";
import {Subject, BehaviorSubject} from "rxjs";
import {TransitionTable} from "./state-machine";
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