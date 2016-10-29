import {ActivityDecisionStates} from "./activity-decision-states";
import {TransitionTable} from "../../state-machine";
export const TRANSITION_TABLE: TransitionTable<ActivityDecisionStates> = [
    [ActivityDecisionStates.Created, ActivityDecisionStates.Sending],
    [ActivityDecisionStates.Created, ActivityDecisionStates.CanceledBeforeSent],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Scheduled],
    [ActivityDecisionStates.Created, ActivityDecisionStates.ScheduleFailed],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Started],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Completed],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Failed],
    [ActivityDecisionStates.Created, ActivityDecisionStates.TimedOut],
    [ActivityDecisionStates.Created, ActivityDecisionStates.Canceled],
    [ActivityDecisionStates.Created, ActivityDecisionStates.CancelRequested],
    [ActivityDecisionStates.Created, ActivityDecisionStates.RequestCancelFailed],


    [ActivityDecisionStates.Sending, ActivityDecisionStates.Sent],

    [ActivityDecisionStates.Sent, ActivityDecisionStates.Scheduled],
    [ActivityDecisionStates.Sent, ActivityDecisionStates.ScheduleFailed],
    [ActivityDecisionStates.Sent, ActivityDecisionStates.CancelledAfterSent],


    [ActivityDecisionStates.Scheduled, ActivityDecisionStates.Started],
    [ActivityDecisionStates.Scheduled, ActivityDecisionStates.CancelRequested],

    [ActivityDecisionStates.Started, ActivityDecisionStates.Completed],
    [ActivityDecisionStates.Started, ActivityDecisionStates.Failed],
    [ActivityDecisionStates.Started, ActivityDecisionStates.TimedOut],
    [ActivityDecisionStates.Started, ActivityDecisionStates.CancelRequested],

    [ActivityDecisionStates.CancelRequested, ActivityDecisionStates.Canceled],
    [ActivityDecisionStates.CancelRequested, ActivityDecisionStates.RequestCancelFailed],
];