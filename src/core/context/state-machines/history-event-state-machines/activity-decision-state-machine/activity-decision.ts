import { ActivityDecisionState } from './activity-decision-states';
import { TRANSITION_TABLE } from './transition-table';
import { AbstractHistoryEventStateMachine, HistoryEventProcessor, UnknownEventTypeException } from '../history-event-state-machine';
import { StateMachine } from '../../state-machine';
import { ActivityTimeoutType } from '../../../../../aws/workflow-history/activity-timeout-type';
import { ScheduleActivityTaskDecisionAttributes, HistoryEvent, ActivityType } from '../../../../../aws/aws.types';
import { EventType } from '../../../../../aws/workflow-history/event-types';

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
  activityType: ActivityType;
  activityId: string;


  setStateToSending(): void;

  setStateToSent(): void;
}

export class BaseActivityDecisionStateMachine extends AbstractHistoryEventStateMachine<ActivityDecisionState> {

  public input: string;
  public control: string;
  public cause: string;
  public details: string;
  public reason: string;
  public result: string;
  public timeoutType: ActivityTimeoutType;
  public startParams: ScheduleActivityTaskDecisionAttributes;
  public identity: string;
  public activityType: ActivityType;
  public activityId: string;

  protected processEvent(eventType: EventType, event: HistoryEvent): void {
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

  constructor(startParams?: ScheduleActivityTaskDecisionAttributes, currentState?: ActivityDecisionState) {
    super(TRANSITION_TABLE, currentState || ActivityDecisionState.Created);
    this.startParams = startParams;
  }

  public toString(): string {
    return JSON.stringify({
      currentState: this.currentState,
      identity: this.identity,
      input: this.input,
      startParams: this.startParams,
      activityType: this.activityType,
      activityId: this.activityId,
    });
  }

  public setStateToSending(): void {
    this.currentState = ActivityDecisionState.Sending;
  }

  public setStateToSent(): void {
    this.currentState = ActivityDecisionState.Sent;
  }

  private processActivityTaskScheduled(event: HistoryEvent): void {
    const params = event.activityTaskScheduledEventAttributes;
    this.currentState = ActivityDecisionState.Scheduled;
    this.control = params.control;
    this.input = params.input;
    this.activityType = params.activityType;
    this.activityId = params.activityId;
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
