import {HistoryEventProcessor} from "../../state-machines/history-event-state-machines/history-event-processor";
import {ScheduleActivityTaskDecisionAttributes, HistoryEvent} from "../../aws/aws.types";
import {DecisionRunContext} from "../../application/context/decision-run-context";
import {BaseActivityDecisionStateMachine} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
export class MockDecisionRunContext implements DecisionRunContext {
    processEventList(eventList: HistoryEvent[]): void {
    }

    getOrCreateActivityStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): BaseActivityDecisionStateMachine {
        return null;
    }

    getStateMachines(): HistoryEventProcessor<any>[] {
        return null;
    }

    getNextId(): string {
        return null;
    }
}
