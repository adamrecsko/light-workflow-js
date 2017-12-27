import { AbstractHistoryEventStateMachine, UnknownEventTypeException } from '../history-event-state-machine';
import { WorkflowExecutionStates } from './workflow-execution-states';
import { TransitionTable } from '../../state-machine';
import { EventType } from '../../../../../aws/workflow-history/event-types';
import { HistoryEvent } from '../../../../../aws/aws.types';
import { TRANSITION_TABLE } from './transition-table';
import {
  CancelWorkflowExecutionFailedEventAttributes, CompleteWorkflowExecutionFailedEventAttributes,
  WorkflowExecutionCanceledEventAttributes, WorkflowExecutionCancelRequestedEventAttributes,
  WorkflowExecutionCompletedEventAttributes, WorkflowExecutionContinuedAsNewEventAttributes, WorkflowExecutionFailedEventAttributes,
  WorkflowExecutionStartedEventAttributes, WorkflowExecutionTerminatedEventAttributes, WorkflowExecutionTimedOutEventAttributes,
} from 'aws-sdk/clients/swf';
import { SWF } from 'aws-sdk';


export type CompositeWorkflowEventParams = WorkflowExecutionStartedEventAttributes &
  WorkflowExecutionCanceledEventAttributes &
  WorkflowExecutionCancelRequestedEventAttributes &
  WorkflowExecutionCompletedEventAttributes &
  WorkflowExecutionContinuedAsNewEventAttributes &
  WorkflowExecutionFailedEventAttributes &
  WorkflowExecutionTerminatedEventAttributes &
  WorkflowExecutionTimedOutEventAttributes &
  CancelWorkflowExecutionFailedEventAttributes &
  CompleteWorkflowExecutionFailedEventAttributes;

export class WorkflowExecution extends AbstractHistoryEventStateMachine<WorkflowExecutionStates>
  implements CompositeWorkflowEventParams {

  // Fields
  newExecutionRunId: SWF.WorkflowRunId;
  reason: SWF.FailureReason | SWF.TerminateReason;
  timeoutType: SWF.WorkflowExecutionTimeoutType;
  input: SWF.Data;
  externalWorkflowExecution: SWF.WorkflowExecution;
  externalInitiatedEventId: SWF.EventId;
  cause: SWF.WorkflowExecutionCancelRequestedCause;
  details: SWF.Data;
  decisionTaskCompletedEventId: SWF.EventId;
  result: SWF.Data;
  executionStartToCloseTimeout: SWF.DurationInSecondsOptional;
  taskStartToCloseTimeout: SWF.DurationInSecondsOptional;
  childPolicy: SWF.ChildPolicy;
  taskList: SWF.TaskList;
  taskPriority: SWF.TaskPriority;
  workflowType: SWF.WorkflowType;
  tagList: SWF.TagList;
  continuedExecutionRunId: SWF.WorkflowRunIdOptional;
  parentWorkflowExecution: SWF.WorkflowExecution;
  parentInitiatedEventId: SWF.EventId;
  lambdaRole: SWF.Arn;

  constructor(currentState?: WorkflowExecutionStates) {
    super(TRANSITION_TABLE, currentState || WorkflowExecutionStates.Created);
  }

  protected processEvent(eventType: EventType, event: HistoryEvent): void {
    switch (eventType) {
      case EventType.WorkflowExecutionStarted:
        this.processStarted(event);
        break;
      case EventType.WorkflowExecutionCompleted:
        this.processCompleted(event);
        break;
      case EventType.WorkflowExecutionCancelRequested:
        this.processCancelRequested(event);
        break;
      case EventType.WorkflowExecutionCanceled:
        this.processCanceled(event);
        break;
      case EventType.CancelWorkflowExecutionFailed:
        this.processFailFailed(event);
        break;
      case EventType.CompleteWorkflowExecutionFailed:
        this.processCompleteFailed(event);
        break;
      case EventType.WorkflowExecutionFailed:
        this.processExecutionFailed(event);
        break;
      case EventType.FailWorkflowExecutionFailed:
        this.processFailFailed(event);
        break;
      case EventType.WorkflowExecutionTimedOut:
        this.processTimedOut(event);
        break;
      case EventType.WorkflowExecutionContinuedAsNew:
        this.processContinuedAsNew(event);
        break;
      case EventType.ContinueAsNewWorkflowExecutionFailed:
        this.processContinuedAsNewFailed(event);
        break;
      case EventType.WorkflowExecutionTerminated:
        this.processTerminated(event);
        break;
      default:
        throw new UnknownEventTypeException(`Unknown HistoryEvent eventType: ${event.eventType}`);
    }
  }

  // parsers:


  private processStarted(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.Started;
    const params = event.workflowExecutionStartedEventAttributes;
    Object.assign(this, params);
  }

  private processCompleted(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.Completed;
    const params = event.workflowExecutionCompletedEventAttributes;
    Object.assign(this, params);
  }

  private processCancelRequested(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.CancelRequested;
    const params = event.workflowExecutionCancelRequestedEventAttributes;
    Object.assign(this, params);
  }

  private processCanceled(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.Canceled;
    const params = event.workflowExecutionCanceledEventAttributes;
    Object.assign(this, params);
  }

  private processCancelFailed(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.CancelFailed;
    const params = event.cancelWorkflowExecutionFailedEventAttributes;
    Object.assign(this, params);
  }

  private processCompleteFailed(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.CompleteFailed;
    const params = event.completeWorkflowExecutionFailedEventAttributes;
    Object.assign(this, params);
  }

  private processExecutionFailed(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.ExecutionFailed;
    const params = event.workflowExecutionFailedEventAttributes;
    Object.assign(this, params);
  }

  private processFailFailed(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.FailFailed;
    const params = event.failWorkflowExecutionFailedEventAttributes;
    Object.assign(this, params);
  }

  private processTimedOut(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.TimedOut;
    const params = event.workflowExecutionTimedOutEventAttributes;
    Object.assign(this, params);
  }

  private processContinuedAsNew(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.ContinuedAsNew;
    const params = event.workflowExecutionContinuedAsNewEventAttributes;
    Object.assign(this, params);
  }

  private processContinuedAsNewFailed(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.ContinueAsNewFailed;
    const params = event.continueAsNewWorkflowExecutionFailedEventAttributes;
    Object.assign(this, params);
  }

  private processTerminated(event: HistoryEvent) {
    this.currentState = WorkflowExecutionStates.Terminated;
    const params = event.workflowExecutionTerminatedEventAttributes;
    Object.assign(this, params);
  }
}
