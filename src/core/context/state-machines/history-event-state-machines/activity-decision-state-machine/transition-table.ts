import { ActivityDecisionState as ADS } from './activity-decision-states';
import { TransitionTable } from '../../state-machine';

export const TRANSITION_TABLE: TransitionTable<ADS> = [
  [ADS.Created, ADS.Sending],
  [ADS.Created, ADS.CanceledBeforeSent],
  [ADS.Created, ADS.Scheduled],

  [ADS.Sending, ADS.Sent],

  [ADS.Sent, ADS.Scheduled],
  [ADS.Sent, ADS.ScheduleFailed],
  [ADS.Sent, ADS.CancelledAfterSent],

  [ADS.Scheduled, ADS.Started],
  [ADS.Scheduled, ADS.CancelRequested],
  [ADS.Scheduled, ADS.Timeout],

  [ADS.Started, ADS.Completed],
  [ADS.Started, ADS.Failed],
  [ADS.Started, ADS.Timeout],
  [ADS.Started, ADS.CancelRequested],

  [ADS.CancelRequested, ADS.Canceled],
  [ADS.CancelRequested, ADS.RequestCancelFailed],
];
