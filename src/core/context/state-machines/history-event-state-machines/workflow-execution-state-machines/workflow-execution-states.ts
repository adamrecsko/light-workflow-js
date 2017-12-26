export enum WorkflowExecutionStates {
  Created = 1,
  CanceledBeforeSent,
  Sending,
  Sent,
  CancelledAfterSent,
  Started,
  CancelRequested,
  Canceled,
  CancelFailed,
  Completed,
  CompleteFailed,
  ExecutionFailed,
  FailFailed,
  TimedOut,
  ContinuedAsNew,
  ContinueAsNewFailed,
  Terminated,
}
