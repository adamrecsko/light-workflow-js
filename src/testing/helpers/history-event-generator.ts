import { EventType } from '../../aws/workflow-history/event-types';
import { HistoryEvent } from '../../aws/aws.types';

import * as faker from 'faker';

const randomTimestampGen = (): Date => {
  return faker.date.past();
};

export class HistoryGenerator {
  public timestampGen: () => Date = randomTimestampGen;
  public currentEventId = 1;

  public createHistoryEvent(eventType: EventType): HistoryEvent {
    const historyEvent: HistoryEvent = {
      eventTimestamp: this.timestampGen(),
      eventType: EventType[eventType],
      eventId: this.currentEventId,
    };
    this.currentEventId++;
    return historyEvent;
  }

  public seek(eventId: number): void {
    this.currentEventId = eventId;
  }
}
