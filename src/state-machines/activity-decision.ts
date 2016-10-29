import {
    TransitionTable,
    AbstractHistoryEventStateMachine
} from "./state-machine";
import {HistoryEvent, ScheduleActivityTaskDecisionAttributes} from "../aws/aws.types";
import {EventType} from "../aws/workflow-history/event-types";


export class UnknownEventTypeException extends Error {
    constructor(message: string) {
        super(message);
    }
}


export enum ActivityDecisionStates{
    Created = -10,
    CanceledBeforeSent,
    Sending,
    Sent,
    CancelledAfterSent,
    Scheduled = EventType.ActivityTaskScheduled,
    ScheduleFailed = EventType.ActivityTaskFailed,
    Started = EventType.ActivityTaskStarted,
    Completed = EventType.ActivityTaskCompleted,
    Failed = EventType.ActivityTaskFailed,
    TimedOut = EventType.ActivityTaskTimedOut,
    Canceled = EventType.ActivityTaskCanceled,
    CancelRequested = EventType.ActivityTaskCancelRequested,
    RequestCancelFailed = EventType.RequestCancelActivityTaskFailed
}


const TRANSITION_TABLE: TransitionTable<ActivityDecisionStates> = [
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


export class ActivityDecisionStateMachine extends AbstractHistoryEventStateMachine<ActivityDecisionStates> {

    public input: string;
    public control: string;
    public cause: string;
    public details: string;
    public reason: string;
    public result: string;
    public timeoutType: string;
    public startParams: ScheduleActivityTaskDecisionAttributes;
    public processedEventIds: Set<number>;


    constructor(startParams: ScheduleActivityTaskDecisionAttributes, currentState?: ActivityDecisionStates) {
        super(TRANSITION_TABLE, currentState || ActivityDecisionStates.Created);
        this.startParams = startParams;
        this.processedEventIds = new Set<number>();
    }

    isProcessed(event: HistoryEvent): boolean {
        return !this.processedEventIds.has(event.eventId);
    }

    processHistoryEvent(event: HistoryEvent): void {
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
                this.processActivityTaskStarted();
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
        this.currentState = ActivityDecisionStates.Sending;
    }

    public setStateToSent(): void {
        this.currentState = ActivityDecisionStates.Sent;
    }


    private processActivityTaskScheduled(event: HistoryEvent): void {
        const params = event.activityTaskScheduledEventAttributes;
        this.control = params.control;
        this.input = params.input;
        this.currentState = ActivityDecisionStates.Scheduled;
    }

    private processScheduleActivityTaskFailed(event: HistoryEvent): void {
        const params = event.scheduleActivityTaskFailedEventAttributes;
        this.cause = params.cause;
        this.currentState = ActivityDecisionStates.ScheduleFailed;
    }

    private processActivityTaskFailed(event: HistoryEvent): void {
        const params = event.activityTaskFailedEventAttributes;
        this.details = params.details;
        this.reason = params.reason;
        this.currentState = ActivityDecisionStates.Failed;
    }

    private processActivityTaskStarted(): void {
        this.currentState = ActivityDecisionStates.Started;
    }

    private processActivityTaskCompleted(event: HistoryEvent): void {
        const params = event.activityTaskCompletedEventAttributes;
        this.result = params.result;
        this.currentState = ActivityDecisionStates.Completed;
    }

    private processActivityTaskTimedOut(event: HistoryEvent): void {
        const params = event.activityTaskTimedOutEventAttributes;
        this.details = params.details;
        this.timeoutType = params.timeoutType;
        this.currentState = ActivityDecisionStates.TimedOut;
    }

    private processActivityTaskCanceled(event: HistoryEvent): void {
        const params = event.activityTaskCanceledEventAttributes;
        this.details = params.details;
        this.currentState = ActivityDecisionStates.Canceled;
    }

    private processActivityTaskCancelRequested(): void {
        this.currentState = ActivityDecisionStates.CancelRequested;
    }

    private processRequestCancelActivityTaskFailed(event: HistoryEvent): void {
        const params = event.requestCancelActivityTaskFailedEventAttributes;
        this.cause = params.cause;
        this.currentState = ActivityDecisionStates.RequestCancelFailed;
    }
}