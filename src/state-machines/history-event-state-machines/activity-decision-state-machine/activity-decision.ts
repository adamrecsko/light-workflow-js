import {AbstractHistoryEventStateMachine} from "../abstract-history-event-state-machine";
import {ActivityDecisionStates} from "./activity-decision-states";
import {ScheduleActivityTaskDecisionAttributes, HistoryEvent} from "../../../aws/aws.types";
import {TRANSITION_TABLE} from "./transition-table";
import {EventType} from "../../../aws/workflow-history/event-types";
export class UnknownEventTypeException extends Error {
    constructor(message: string) {
        super(message);
    }
}


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
    public identity: string;


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
        this.currentState = ActivityDecisionStates.Sending;
    }

    public setStateToSent(): void {
        this.currentState = ActivityDecisionStates.Sent;
    }


    private processActivityTaskScheduled(event: HistoryEvent): void {
        const params = event.activityTaskScheduledEventAttributes;
        this.currentState = ActivityDecisionStates.Scheduled;
        this.control = params.control;
        this.input = params.input;
    }

    private processScheduleActivityTaskFailed(event: HistoryEvent): void {
        const params = event.scheduleActivityTaskFailedEventAttributes;
        this.currentState = ActivityDecisionStates.ScheduleFailed;
        this.cause = params.cause;
    }

    private processActivityTaskFailed(event: HistoryEvent): void {
        const params = event.activityTaskFailedEventAttributes;
        this.currentState = ActivityDecisionStates.Failed;
        this.details = params.details;
        this.reason = params.reason;
    }

    private processActivityTaskStarted(event:HistoryEvent): void {
        this.currentState = ActivityDecisionStates.Started;
        this.identity = event.activityTaskStartedEventAttributes.identity;
    }

    private processActivityTaskCompleted(event: HistoryEvent): void {
        const params = event.activityTaskCompletedEventAttributes;
        this.currentState = ActivityDecisionStates.Completed;
        this.result = params.result;
    }

    private processActivityTaskTimedOut(event: HistoryEvent): void {
        const params = event.activityTaskTimedOutEventAttributes;
        this.currentState = ActivityDecisionStates.TimedOut;
        this.details = params.details;
        this.timeoutType = params.timeoutType;
    }

    private processActivityTaskCanceled(event: HistoryEvent): void {
        const params = event.activityTaskCanceledEventAttributes;
        this.currentState = ActivityDecisionStates.Canceled;
        this.details = params.details;
    }

    private processActivityTaskCancelRequested(): void {
        this.currentState = ActivityDecisionStates.CancelRequested;
    }

    private processRequestCancelActivityTaskFailed(event: HistoryEvent): void {
        const params = event.requestCancelActivityTaskFailedEventAttributes;
        this.currentState = ActivityDecisionStates.RequestCancelFailed;
        this.cause = params.cause;
    }
}