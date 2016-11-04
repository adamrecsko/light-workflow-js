import {HistoryEvent, ScheduleActivityTaskDecisionAttributes} from "../../aws/aws.types";
import {EventType} from "../../aws/workflow-history/event-types";
import {AbstractHistoryEventStateMachine} from "../../state-machines/history-event-state-machines/abstract-history-event-state-machine";
import {ActivityDecisionStateMachine} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
import {ActivityDecisionStates} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
export interface DecisionRunContext {
    processEventList(eventList: HistoryEvent[]): void;
    getOrCreateActivityStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine;
    getStateMachines(): AbstractHistoryEventStateMachine<any>[];
}


export class NotSupportedEventTypeException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class DecisionConflictException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class BaseDecisionRunContext implements DecisionRunContext {
    private activityIdToStateMachine: Map<string,ActivityDecisionStateMachine>;
    private scheduleEventIdToActivityId: Map<number,string>;

    constructor() {
        this.activityIdToStateMachine = new Map();
        this.scheduleEventIdToActivityId = new Map();
    }

    processEventList(eventList: HistoryEvent[]): void {
        const process = (event: HistoryEvent)=> {
            const eventType: EventType = (<any> EventType)[event.eventType];
            let activityId: string;
            let eventId: number;
            switch (eventType) {
                case EventType.ActivityTaskScheduled:
                    eventId = event.eventId;
                    activityId = event.activityTaskScheduledEventAttributes.activityId;
                    this.scheduleEventIdToActivityId.set(eventId, activityId);
                    break;
                case EventType.ScheduleActivityTaskFailed:
                    activityId = event.scheduleActivityTaskFailedEventAttributes.activityId;
                    break;
                case EventType.ActivityTaskFailed:
                    eventId = event.activityTaskFailedEventAttributes.scheduledEventId;
                    activityId = this.scheduleEventIdToActivityId.get(eventId);
                    break;
                case EventType.ActivityTaskStarted:
                    eventId = event.activityTaskStartedEventAttributes.scheduledEventId;
                    activityId = this.scheduleEventIdToActivityId.get(eventId);
                    break;
                case EventType.ActivityTaskCompleted:
                    eventId = event.activityTaskCompletedEventAttributes.scheduledEventId;
                    activityId = this.scheduleEventIdToActivityId.get(eventId);
                    break;
                case EventType.ActivityTaskTimedOut:
                    eventId = event.activityTaskTimedOutEventAttributes.scheduledEventId;
                    activityId = this.scheduleEventIdToActivityId.get(eventId);
                    break;
                case EventType.ActivityTaskCanceled:
                    eventId = event.activityTaskCanceledEventAttributes.scheduledEventId;
                    activityId = this.scheduleEventIdToActivityId.get(eventId);
                    break;
                case EventType.ActivityTaskCancelRequested:
                    activityId = event.activityTaskCancelRequestedEventAttributes.activityId;
                    break;
                case EventType.RequestCancelActivityTaskFailed:
                    activityId = event.requestCancelActivityTaskFailedEventAttributes.activityId;
                    break;

                case EventType.DecisionTaskScheduled:
                case EventType.DecisionTaskStarted:
                case EventType.DecisionTaskCompleted:
                case EventType.DecisionTaskTimedOut:
                    break;

                default:
                    throw new NotSupportedEventTypeException(`Not supported event type ${event.eventType}`);
            }

            let stateMachine: ActivityDecisionStateMachine;
            if (this.activityIdToStateMachine.has(activityId)) {
                stateMachine = this.activityIdToStateMachine.get(activityId);
            } else {
                if (eventType === EventType.ActivityTaskScheduled) {
                    stateMachine = new ActivityDecisionStateMachine(null);
                    this.activityIdToStateMachine.set(activityId, stateMachine);
                } else {
                    throw new DecisionConflictException(`Missing decision machine for activity id ${activityId}`);
                }
            }
            stateMachine.processHistoryEvent(event);
        };
        const notify = (stateMachine: AbstractHistoryEventStateMachine<any>)=>stateMachine.notify();
        eventList.forEach(process);
        this.getStateMachines().forEach(notify);
    }

    public getOrCreateActivityStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine {
        if (this.activityIdToStateMachine.has(attributes.activityId)) {
            return this.activityIdToStateMachine.get(attributes.activityId);
        } else {
            return this.createActivityStateMachine(attributes);
        }
    }

    private createActivityStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine {
        const stateMachine = new ActivityDecisionStateMachine(attributes);
        this.activityIdToStateMachine.set(attributes.activityId, stateMachine);
        return stateMachine;
    }

    getStateMachines(): AbstractHistoryEventStateMachine<any>[] {
        return Array.from(this.activityIdToStateMachine.values());
    }
}
