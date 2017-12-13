import { ActivityDecisionState } from './activity-decision-states';
import { TRANSITION_TABLE } from './transition-table';
import { BaseNotifyableStateMachine } from '../../notifyable-state-machine';
import { HistoryEventProcessor } from '../history-event-processor';
import { StateMachine } from '../../state-machine';
import { ActivityTimeoutType } from '../../../../aws/workflow-history/activity-timeout-type';
import { ScheduleActivityTaskDecisionAttributes, HistoryEvent } from '../../../../aws/aws.types';
import { EventType } from '../../../../aws/workflow-history/event-types';


export class UnknownEventTypeException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface ActivityDecisionStateMachine extends HistoryEventProcessor<ActivityDecisionState>, StateMachine<ActivityDecisionState> {
  input: string;
  control: string;
  cause: string;
  details: string;
  reason: string;
  result: string;
  timeoutType: ActivityTimeoutType;
  startParams: ScheduleActivityTaskDecisionAttributes;
  identity: string;
  setStateToSending(): void;
  setStateToSent(): void;
}

export class BaseActivityDecisionStateMachine extends BaseNotifyableStateMachine<ActivityDecisionState> implements ActivityDecisionStateMachine {

  public input: string;
  public control: string;
  public cause: string;
  public details: string;
  public reason: string;
  public result: string;
  public timeoutType: ActivityTimeoutType;
  public startParams: ScheduleActivityTaskDecisionAttributes;
  public identity: string;
  private processedEventIds: Set<number>;


  constructor(startParams: ScheduleActivityTaskDecisionAttributes, currentState?: ActivityDecisionState) {
    super(TRANSITION_TABLE, currentState || ActivityDecisionState.Created);
    this.startParams = startParams;
    this.processedEventIds = new Set<number>();
  }

  public processHistoryEvent(event: HistoryEvent): void {
    /*
     Do not process if already in the state
     */
    if (!this.isProcessed(event)) return;

    this.processedEventIds.add(event.eventId);
    const eventType: EventType = EventType.fromString(event.eventType);

    switch (eventType) {
      case EventType.ActivityTaskScheduled:
        this.processActivityTaskScheduled(event);
        break;

      case EventType.ScheduleActivityTaskFailed:
        this.processScheduleActivityTaskFailed(event);
        break;

      case EventType.ActivityTaskFailed:
        this.processActivityTaskFailed(event);
        break;

      case EventType.ActivityTaskStarted:
        this.processActivityTaskStarted(event);
        break;

      case EventType.ActivityTaskCompleted:
        this.processActivityTaskCompleted(event);
        break;

      case EventType.ActivityTaskTimedOut:
        this.processActivityTaskTimedOut(event);
        break;

      case EventType.ActivityTaskCanceled:
        this.processActivityTaskCanceled(event);
        break;

      case EventType.ActivityTaskCancelRequested:
        this.processActivityTaskCancelRequested();
        break;

      case EventType.RequestCancelActivityTaskFailed:
        this.processRequestCancelActivityTaskFailed(event);
        break;
      default:
        throw new UnknownEventTypeException(`Unknown HistoryEvent eventType: ${event.eventType}`);
    }
  }

  public setStateToSending(): void {
    this.currentState = ActivityDecisionState.Sending;
  }

  public setStateToSent(): void {
    this.currentState = ActivityDecisionState.Sent;
  }


  private isProcessed(event: HistoryEvent): boolean {
    return !this.processedEventIds.has(event.eventId);
  }

  private processActivityTaskScheduled(event: HistoryEvent): void {
    const params = event.activityTaskScheduledEventAttributes;
    this.currentState = ActivityDecisionState.Scheduled;
    this.control = params.control;
    this.input = params.input;
  }

  private processScheduleActivityTaskFailed(event: HistoryEvent): void {
    const params = event.scheduleActivityTaskFailedEventAttributes;
    this.currentState = ActivityDecisionState.ScheduleFailed;
    this.cause = params.cause;
  }

  private processActivityTaskFailed(event: HistoryEvent): void {
    const params = event.activityTaskFailedEventAttributes;
    this.currentState = ActivityDecisionState.Failed;
    this.details = params.details;
    this.reason = params.reason;
  }

  private processActivityTaskStarted(event: HistoryEvent): void {
    this.currentState = ActivityDecisionState.Started;
    this.identity = event.activityTaskStartedEventAttributes.identity;
  }

  private processActivityTaskCompleted(event: HistoryEvent): void {
    const params = event.activityTaskCompletedEventAttributes;
    this.currentState = ActivityDecisionState.Completed;
    this.result = params.result;
  }

  private processActivityTaskTimedOut(event: HistoryEvent): void {
    const params = event.activityTaskTimedOutEventAttributes;
    this.currentState = ActivityDecisionState.Timeout;
    this.details = params.details;
    this.timeoutType = ActivityTimeoutType.fromString(params.timeoutType);
  }

  private processActivityTaskCanceled(event: HistoryEvent): void {
    const params = event.activityTaskCanceledEventAttributes;
    this.currentState = ActivityDecisionState.Canceled;
    this.details = params.details;
  }

  private processActivityTaskCancelRequested(): void {
    this.currentState = ActivityDecisionState.CancelRequested;
  }

  private processRequestCancelActivityTaskFailed(event: HistoryEvent): void {
    const params = event.requestCancelActivityTaskFailedEventAttributes;
    this.currentState = ActivityDecisionState.RequestCancelFailed;
    this.cause = params.cause;
  }
}
