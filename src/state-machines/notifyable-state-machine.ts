import {BaseStateMachine} from "./base-state-machine";
import {Subject, Observable, BehaviorSubject} from "rxjs";
import {TransitionTable} from "./state-machine";
export class NotifyableStateMachine<T> extends BaseStateMachine<T> {
    public stateObservable: Subject<T>;
    public onChange: Observable<T>;

    constructor(transitionTable: TransitionTable<T>, currentState: T) {
        super(transitionTable, currentState);
        this.stateObservable = new BehaviorSubject<T>(currentState);
        this.onChange = this.stateObservable.distinctUntilChanged();
    }

    goTo(state: T): void {
        super.goTo(state);
    }

    notify() {
        this.stateObservable.next(this.currentState);
    }
}
