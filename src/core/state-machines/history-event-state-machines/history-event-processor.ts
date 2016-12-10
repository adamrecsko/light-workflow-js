import {Notifiable} from "../notifyable-state-machine";
import {HistoryEvent} from "../../../aws/aws.types";

export interface HistoryEventProcessor<T> extends Notifiable<T> {
    processHistoryEvent(event: HistoryEvent): void;
}
