import {HistoryEvent} from "../../aws/aws.types";
import {Notifiable} from "../notifyable-state-machine";

export interface HistoryEventProcessor<T> extends Notifiable<T> {
    processHistoryEvent(event: HistoryEvent): void;
}
