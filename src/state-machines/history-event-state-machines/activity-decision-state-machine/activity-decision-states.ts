export enum ActivityDecisionState{
    Created = 1,
    CanceledBeforeSent,
    Sending,
    Sent,
    CancelledAfterSent,
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
