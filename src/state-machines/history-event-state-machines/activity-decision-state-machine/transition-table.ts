import {ActivityDecisionState} from "./activity-decision-states";
import {TransitionTable} from "../../state-machine";
export const TRANSITION_TABLE: TransitionTable<ActivityDecisionState> = [
    [ActivityDecisionState.Created, ActivityDecisionState.Sending],
    [ActivityDecisionState.Created, ActivityDecisionState.CanceledBeforeSent],
    [ActivityDecisionState.Created, ActivityDecisionState.Scheduled],

    [ActivityDecisionState.Sending, ActivityDecisionState.Sent],

    [ActivityDecisionState.Sent, ActivityDecisionState.Scheduled],
    [ActivityDecisionState.Sent, ActivityDecisionState.ScheduleFailed],
    [ActivityDecisionState.Sent, ActivityDecisionState.CancelledAfterSent],


    [ActivityDecisionState.Scheduled, ActivityDecisionState.Started],
    [ActivityDecisionState.Scheduled, ActivityDecisionState.CancelRequested],
    [ActivityDecisionState.Scheduled, ActivityDecisionState.Timeout],


    [ActivityDecisionState.Started, ActivityDecisionState.Completed],
    [ActivityDecisionState.Started, ActivityDecisionState.Failed],
    [ActivityDecisionState.Started, ActivityDecisionState.Timeout],
    [ActivityDecisionState.Started, ActivityDecisionState.CancelRequested],

    [ActivityDecisionState.CancelRequested, ActivityDecisionState.Canceled],
    [ActivityDecisionState.CancelRequested, ActivityDecisionState.RequestCancelFailed],
];