import { EventType } from '../../aws/workflow-history/event-types';
import { HistoryEvent } from '../../aws/aws.types';

import * as chai from 'chai';
chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;

export function getParams(event: HistoryEvent): any {
  const eventType = event.eventType;
  const eventAttributes: string = eventType.charAt(0).toLocaleLowerCase()
    + eventType.slice(1)
    + 'EventAttributes';

  return (<any>event)[eventAttributes];
}

export type EventExpectation = {
  eventType: EventType,
  params: any,
  eventId: number,
};


export function expectHistoryEvent(event: HistoryEvent, expectation: EventExpectation): void {
  const eventType = EventType.fromString(event.eventType);
  expect(eventType).to.eq(expectation.eventType, `Expected: ${EventType[expectation.eventType]}  but got: ${event.eventType}`);
  (<any>expect(getParams(event)).to).shallowDeepEqual(expectation.params);
  expect(event.eventId).to.eq(expectation.eventId);
}
