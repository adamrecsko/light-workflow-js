import { BaseNotifiableStateMachine, Notifiable, NotifiableStateMachine } from '../notifiable-state-machine';
import { HistoryEvent } from '../../../../aws/aws.types';
import { ActivityDecisionState } from './activity-decision-state-machine/activity-decision-states';
import { InvalidStateTransitionException, TransitionTable } from '../state-machine';
import { EventType } from '../../../../aws/workflow-history/event-types';


export class UnprocessableEventException extends Error {
  private historyEvent: HistoryEvent;

  constructor(historyEvent: HistoryEvent) {
    super('Unprocessable Event');
    this.historyEvent = historyEvent;
  }
}

export class UnknownEventTypeException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface HistoryEventProcessor<T = {}> extends Notifiable<T> {
  processHistoryEvent(event: HistoryEvent): void;
}

export interface HistoryEventStateMachine<T> extends HistoryEventProcessor<T>, NotifiableStateMachine<T>{
}


export abstract class AbstractHistoryEventStateMachine<T> extends BaseNotifiableStateMachine<T> implements HistoryEventStateMachine<T> {
  private processedEventIds: Set<number>;

  constructor(transitionTable: TransitionTable<T>, currentState: T) {
    super(transitionTable, currentState);
    this.processedEventIds = new Set<number>();
  }

  protected abstract processEvent(eventType: EventType, event: HistoryEvent): void;

  public processHistoryEvent(event: HistoryEvent): void {
    const eventType: EventType = EventType.fromString(event.eventType);
    if (!this.isProcessed(event)) {
      try {
        this.processEvent(eventType, event);
        this.eventProcessed(event);
      } catch (e) {
        if (e instanceof InvalidStateTransitionException) {
          throw e;
        }
        throw new UnprocessableEventException(event);
      }
    }
  }

  private isProcessed(event: HistoryEvent): boolean {
    return this.processedEventIds.has(event.eventId);
  }

  private eventProcessed(event: HistoryEvent): void {
    this.processedEventIds.add(event.eventId);
  }
}
