import {ObservableStateMachine, TransitionTable} from "./state-machine";
import {HistoryEvent, ActivityType, TaskList} from "../aws/aws.types";
import {EventType} from "../aws/workflow-history/event-types";


export class UnknownEventTypeException extends Error {
    constructor(message: string) {
        super(message);
    }
}


export enum ActivityDecisionStates{
    Created = 1,
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
    [ActivityDecisionStates.Created, ActivityDecisionStates.Canceled],
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

    public activityType: ActivityType;
    public activityId: string;
    public input: string;
    public control: string;
    public taskList: TaskList;
    public cause: string;
    public details: string;
    public reason: string;
    public result: string;
    public timeoutType: string;

    constructor(currentState?: ActivityDecisionStates) {
        super(TRANSITION_TABLE, currentState || ActivityDecisionStates.Created);
    }

    processHistoryEvent(event: HistoryEvent) {
        const eventType: EventType = (<any> EventType)[event.eventType];
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