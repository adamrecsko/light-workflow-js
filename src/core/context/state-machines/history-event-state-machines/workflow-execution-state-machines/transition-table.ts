import { WorkflowExecutionStates as WES } from './workflow-execution-states';
import { TransitionTable } from '../../state-machine';

export const TRANSITION_TABLE: TransitionTable<WES> = [
  [WES.Created, WES.CanceledBeforeSent],
  [WES.Created, WES.Sending],
  [WES.Sending, WES.Sent],
  [WES.Sent, WES.CancelledAfterSent],
  [WES.Sent, WES.Started],
  [WES.Created, WES.Started],

  [WES.Started, WES.CancelRequested],
  [WES.CancelRequested, WES.Canceled],
  [WES.CancelRequested, WES.CancelFailed],

  [WES.Started, WES.CompletedStateRequested],
  [WES.Started, WES.Completed],
  [WES.Started, WES.CompleteFailed],
  [WES.Started, WES.TimedOut],
  [WES.Started, WES.Terminated],
  [WES.Started, WES.ContinuedAsNew],
  [WES.Started, WES.ContinueAsNewFailed],

  [WES.CompletedStateRequested, WES.Completed],
  [WES.CompletedStateRequested, WES.CompleteFailed],
  [WES.CompletedStateRequested, WES.TimedOut],
  [WES.CompletedStateRequested, WES.Terminated],

  [WES.Started, WES.ExecutionFailedStateRequested],
  [WES.Started, WES.ExecutionFailed],
  [WES.ExecutionFailedStateRequested, WES.ExecutionFailed],

  [WES.Started, WES.FailFailed],
];
