export interface StateMachine<T> {
  goTo(state: T): void;
  currentState: T;
  stateHistory: T[];
}

export type TransitionTable<T> = [T, T][];


export class InvalidStateTransitionException extends Error {
  constructor(message: string) {
    super(message);
  }
}

