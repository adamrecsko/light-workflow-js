import {ObservableStateMachine, TransitionTable} from "./state-machine";
import {HistoryEvent} from "../aws/aws.types";


export enum ActivityDecisionStates{
    Created,
    Sent,
    CanceledBeforeSent,
    Scheduled,
    ScheduleFailed,
    Started,
    Completed,
    Failed,
    TimedOut,
    Canceled,
    CancelRequested,
    RequestCancelFailed
}

const TRANSITION_TABLE: TransitionTable<ActivityDecisionStates> = [
    [ActivityDecisionStates.Created, ActivityDecisionStates.Sent],
    [ActivityDecisionStates.Created, ActivityDecisionStates.CanceledBeforeSent],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Scheduled],
    [ActivityDecisionStates.Created, ActivityDecisionStates.ScheduleFailed],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Started],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Completed],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Failed],
    [ActivityDecisionStates.Created, ActivityDecisionStates.TimedOut],
    [ActivityDecisionStates.Created, ActivityDecisionStates.CancelRequested],
    [ActivityDecisionStates.Created, ActivityDecisionStates.RequestCancelFailed],

    [ActivityDecisionStates.Sent, ActivityDecisionStates.Scheduled],
    [ActivityDecisionStates.Sent, ActivityDecisionStates.ScheduleFailed],

    [ActivityDecisionStates.Scheduled, ActivityDecisionStates.Started],
    [ActivityDecisionStates.Scheduled, ActivityDecisionStates.CancelRequested],

    [ActivityDecisionStates.Started, ActivityDecisionStates.Completed],
    [ActivityDecisionStates.Started, ActivityDecisionStates.Failed],
    [ActivityDecisionStates.Started, ActivityDecisionStates.TimedOut],

    [ActivityDecisionStates.CancelRequested, ActivityDecisionStates.Canceled],
    [ActivityDecisionStates.CancelRequested, ActivityDecisionStates.RequestCancelFailed],
];

export class ActivityDecisionStateMachine extends ObservableStateMachine<ActivityDecisionStates> {

    constructor(currentState: ActivityDecisionStates) {
        super(TRANSITION_TABLE, currentState);
    }

    processHistoryEvent(event: HistoryEvent) {

    }

}