

import {EventType} from "../../aws/workflow-history/event-types";
import {HistoryEvent} from "../../aws/aws.types";

import  * as faker from 'faker';

const randomTimestampGen = (): number=> {
    return faker.date.past().getTime();
};
export class HistoryGenerator {
    public timestampGen: ()=>number = randomTimestampGen;
    public currentEventId: number = 1;

    public createHistoryEvent(eventType: EventType): HistoryEvent {
        const historyEvent: HistoryEvent = {
            eventTimestamp: this.timestampGen(),
            eventType: EventType[eventType],
            eventId: this.currentEventId
        };
        this.currentEventId++;
        return historyEvent;
    }
}
