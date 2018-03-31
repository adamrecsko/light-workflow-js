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


  if (!(<any>event)[eventAttributes]) {
    const msg = `expected event attributes "${eventAttributes}" is missing from event: \n ${JSON.stringify(event, null, 2)}`;
    throw new Error(msg);
  }

  return (<any>event)[eventAttributes];
}

export type EventExpectation<T> = {
  eventType: EventType,
  params: Partial<T>,
  eventId: number,
};


export function expectHistoryEvent<T = any>(event: HistoryEvent, expectation: EventExpectation<T>): void {
  const eventType = EventType.fromString(event.eventType);
  expect(eventType).to.eq(expectation.eventType, `Expected: ${EventType[expectation.eventType]}  but got: ${event.eventType}`);
  (<any>expect(getParams(event)).to).shallowDeepEqual(expectation.params, 'params do not march');
  expect(event.eventId).to.eq(expectation.eventId);
}
