import {ScheduleActivityTaskDecisionAttributes, HistoryEvent} from "../../../../aws/aws.types";
import {ActivityDecisionState} from "../../../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
import {Observable} from "rxjs";
import {DecisionRunContext} from "../../../context/decision-run-context";
import {HistoryEventProcessor} from "../../../../state-machines/history-event-state-machines/history-event-processor";
import {
    BaseActivityDecisionStateMachine,
    ActivityDecisionStateMachine
} from "../../../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
import {ActivityTimeoutType} from "../../../../aws/workflow-history/activity-timeout-type";


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


export class MockActivityDecisionStateMachine implements ActivityDecisionStateMachine {
    input: string;
    control: string;
    cause: string;
    details: string;
    reason: string;
    result: string;
    timeoutType: ActivityTimeoutType;
    startParams: ScheduleActivityTaskDecisionAttributes;
    identity: string;
    onChange: Observable<ActivityDecisionState>;
    currentState: ActivityDecisionState;
    stateHistory: any[] = [];

    setStateToSending(): void {
    }


    setStateToSent(): void {
    }

    processHistoryEvent(event: HistoryEvent): void {
    }

    notify(): void {
    }

    goTo(state: ActivityDecisionState): void {
    }
}
