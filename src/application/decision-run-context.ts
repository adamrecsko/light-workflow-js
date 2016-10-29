import {
    ActivityDecisionStateMachine,
    ActivityDecisionStates
} from "../state-machines/activity-decision";
import {ScheduleActivityTaskDecisionAttributes, HistoryEvent} from "../aws/aws.types";
import {EventType} from "../aws/workflow-history/event-types";
import {AbstractHistoryEventStateMachine} from "../state-machines/state-machine";
export interface DecisionRunContext {
    processEventList(eventList: HistoryEvent[]): void;
    getActivityDecisionStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine;
    getStateMachines(): AbstractHistoryEventStateMachine<any>[];
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
                    eventId = event.activityTaskCanceledEventAttributes.scheduledEventId;
                    activityId = this.scheduleEventIdToActivityId.get(eventId);
                    break;
                case EventType.RequestCancelActivityTaskFailed:
                    activityId = event.requestCancelActivityTaskFailedEventAttributes.activityId;
                    break;

                default:
                    throw Error(`Not supported event type ${event.eventType}`);
            }

            let stateMachine: ActivityDecisionStateMachine;
            if (this.activityIdToStateMachine.has(activityId)) {
                stateMachine = this.activityIdToStateMachine.get(activityId);
            } else {
                if (eventType === EventType.ActivityTaskScheduled) {
                    stateMachine = new ActivityDecisionStateMachine(null);
                    this.activityIdToStateMachine.set(activityId, stateMachine);
                }
            }
            stateMachine.processHistoryEvent(event);
        };
        eventList.forEach(process);
    }

    getActivityDecisionStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine {
        if (this.activityIdToStateMachine.has(attributes.activityId)) {
            return this.activityIdToStateMachine.get(attributes.activityId);
        } else {
            return this.createActivityStateMachine(attributes);
        }
    }

    public createActivityStateMachine(attributes: ScheduleActivityTaskDecisionAttributes, state?: ActivityDecisionStates): ActivityDecisionStateMachine {
        const stateMachine = new ActivityDecisionStateMachine(attributes, state);
        this.activityIdToStateMachine.set(attributes.activityId, stateMachine);
        return stateMachine;
    }

    getStateMachines(): AbstractHistoryEventStateMachine<any>[] {
        return Array.from(this.activityIdToStateMachine.values());
    }
}
