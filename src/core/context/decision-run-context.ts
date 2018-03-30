import { DecisionTask, HistoryEvent, ScheduleActivityTaskDecisionAttributes } from '../../aws/aws.types';
import { EventType } from '../../aws/workflow-history/event-types';
import {
  BaseActivityDecisionStateMachine,
  ActivityDecisionStateMachine,
} from './state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { HistoryEventProcessor } from './state-machines/history-event-state-machines/history-event-state-machine';
import { WorkflowExecution } from './state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution';
import { DECISION_RUN_CONTEXT_ZONE_KEY } from '../../constants';


export interface DecisionRunContext {
  processEventList(decisionTask: DecisionTask): void;

  scheduleActivity(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine;

  getStateMachines(): HistoryEventProcessor<any>[];

  getNextId(): string;

  getWorkflowExecution(): WorkflowExecution;

  getZone(): Zone;
}


export class NotSupportedEventTypeException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BaseDecisionRunContext implements DecisionRunContext {


  private keyToStateMachine: Map<string, HistoryEventProcessor<any>>;
  private scheduleEventIdToActivityId: Map<number, string>;
  private currentId: number;
  private workflowExecution: WorkflowExecution;
  private zone: Zone;


  constructor() {
    this.keyToStateMachine = new Map();
    this.scheduleEventIdToActivityId = new Map();
    this.currentId = 0;
    this.zone = Zone.current.fork({
      name: 'RunContext Zone',
      properties: {
        [DECISION_RUN_CONTEXT_ZONE_KEY]: this,
      },
    });
    this.workflowExecution = new WorkflowExecution();
  }

  processEventList(decisionTask: DecisionTask): void {
    const { events } = decisionTask;
    const notify = (stateMachine: HistoryEventProcessor<any>) => stateMachine.notify();
    const parseEvent = (event: HistoryEvent) => {
      let stateMachine: HistoryEventProcessor<any>;
      const eventType: EventType = EventType.fromString(event.eventType);
      let activityId: string;
      let eventId: number;
      switch (eventType) {
        case EventType.ActivityTaskScheduled:
          eventId = event.eventId;
          activityId = event.activityTaskScheduledEventAttributes.activityId;
          this.scheduleEventIdToActivityId.set(eventId, activityId);
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ScheduleActivityTaskFailed:
          activityId = event.scheduleActivityTaskFailedEventAttributes.activityId;
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ActivityTaskFailed:
          eventId = event.activityTaskFailedEventAttributes.scheduledEventId;
          activityId = this.scheduleEventIdToActivityId.get(eventId);
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ActivityTaskStarted:
          eventId = event.activityTaskStartedEventAttributes.scheduledEventId;
          activityId = this.scheduleEventIdToActivityId.get(eventId);
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ActivityTaskCompleted:
          eventId = event.activityTaskCompletedEventAttributes.scheduledEventId;
          activityId = this.scheduleEventIdToActivityId.get(eventId);
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ActivityTaskTimedOut:
          eventId = event.activityTaskTimedOutEventAttributes.scheduledEventId;
          activityId = this.scheduleEventIdToActivityId.get(eventId);
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ActivityTaskCanceled:
          eventId = event.activityTaskCanceledEventAttributes.scheduledEventId;
          activityId = this.scheduleEventIdToActivityId.get(eventId);
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.ActivityTaskCancelRequested:
          activityId = event.activityTaskCancelRequestedEventAttributes.activityId;
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;
        case EventType.RequestCancelActivityTaskFailed:
          activityId = event.requestCancelActivityTaskFailedEventAttributes.activityId;
          stateMachine = this.getOrCreateActivityStateMachine(activityId);
          break;

        case EventType.DecisionTaskScheduled:
        case EventType.DecisionTaskStarted:
        case EventType.DecisionTaskCompleted:
        case EventType.DecisionTaskTimedOut:
          break;

        case EventType.WorkflowExecutionStarted:
        case EventType.WorkflowExecutionCompleted:
        case EventType.WorkflowExecutionTerminated:
        case EventType.WorkflowExecutionContinuedAsNew:
        case EventType.WorkflowExecutionTimedOut:
        case EventType.WorkflowExecutionFailed:
        case EventType.WorkflowExecutionCanceled:
        case EventType.WorkflowExecutionCancelRequested:
        case EventType.WorkflowExecutionSignaled:
        case EventType.FailWorkflowExecutionFailed:
        case EventType.CompleteWorkflowExecutionFailed:
        case EventType.CancelWorkflowExecutionFailed:
          stateMachine = this.workflowExecution;
          break;


        default:
          throw new NotSupportedEventTypeException(`Not supported event type ${event.eventType}`);
      }

      stateMachine.processHistoryEvent(event);
    };
    events.forEach(parseEvent);
    this.getStateMachines().forEach(notify);
    this.workflowExecution.notify();
  }

  public scheduleActivity(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine {
    const { activityId } = attributes;
    const stateMachine = this.getOrCreateActivityStateMachine(activityId);
    stateMachine.startParams = attributes;
    return stateMachine;
  }

  private getOrCreateActivityStateMachine(activityId: string): ActivityDecisionStateMachine {
    const key = `activityId:${activityId}`;
    if (this.keyToStateMachine.has(key)) {
      return <ActivityDecisionStateMachine> this.keyToStateMachine.get(key);
    }
    const stateMachine = new BaseActivityDecisionStateMachine();
    this.keyToStateMachine.set(key, stateMachine);
    return stateMachine;
  }


  getStateMachines(): HistoryEventProcessor<any>[] {
    return Array.from(this.keyToStateMachine.values());
  }

  getNextId(): string {
    return `${this.currentId++}`;
  }

  getWorkflowExecution(): WorkflowExecution {
    return this.workflowExecution;
  }

  getZone(): Zone {
    return this.zone;
  }
}
