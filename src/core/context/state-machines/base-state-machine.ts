import { StateMachine, TransitionTable, InvalidStateTransitionException } from './state-machine';

export class BaseStateMachine<T> implements StateMachine<T> {
  public stateHistory: T[] = [];
  private privateCurrentState: T;


  constructor(private transitionTable: TransitionTable<T>, initialState: T) {
    this.stateHistory.push(initialState);
    this.privateCurrentState = initialState;
  }


  public get currentState(): T {
    return this.privateCurrentState;
  }

  public set currentState(value: T) {
    this.goTo(value);
  }

  public goTo(state: T): void {
    if (this.isValidTransition(state)) {
      this.privateCurrentState = state;
      this.stateHistory.push(this.privateCurrentState);
    } else {
      throw new InvalidStateTransitionException(
        `Transition table does not allow change: ${this.privateCurrentState} -> ${state}`,
      );
    }
  }

  private isValidTransition(state: T): boolean {
    const stateSet = new Set<T>();
    this.transitionTable.forEach((entry) => {
      if (entry[0] === this.privateCurrentState) {
        stateSet.add(entry[1]);
      }
    });
    return stateSet.has(state);
  }
}

