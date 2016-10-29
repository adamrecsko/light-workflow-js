import {NotifyableStateMachine} from "../notifyable-state-machine";
import {HistoryEvent} from "../../aws/aws.types";
export abstract class AbstractHistoryEventStateMachine<T> extends NotifyableStateMachine<T> {
    abstract processHistoryEvent(event: HistoryEvent): void;
}

