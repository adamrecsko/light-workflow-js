import { HistoryGenerator } from './history-event-generator';
import { HistoryEvent, TaskList } from '../../aws/aws.types';
import { EventType } from '../../aws/workflow-history/event-types';


import {
  CancelWorkflowExecutionFailedEventAttributes, ChildPolicy, CompleteWorkflowExecutionFailedEventAttributes,
  ContinueAsNewWorkflowExecutionFailedEventAttributes, FailWorkflowExecutionFailedEventAttributes,
  WorkflowExecutionCanceledEventAttributes, WorkflowExecutionCancelRequestedEventAttributes,
  WorkflowExecutionCompletedEventAttributes, WorkflowExecutionContinuedAsNewEventAttributes, WorkflowExecutionFailedEventAttributes,
  WorkflowExecutionStartedEventAttributes, WorkflowExecutionTerminatedEventAttributes, WorkflowExecutionTimedOutEventAttributes, WorkflowType,
} from 'aws-sdk/clients/swf';

export class WorkflowHistoryGenerator extends HistoryGenerator {
  constructor(public workflowType: WorkflowType = { name: 'default-test', version: '1' },
              public taskList: TaskList = { name: 'default' },
              public childPolicy: ChildPolicy = 'TERMINATE') {
    super();
  }

  createStartedEvent(params: Partial<WorkflowExecutionStartedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionStarted);
    event.workflowExecutionStartedEventAttributes = {
      workflowType: this.workflowType,
      taskList: this.taskList,
      childPolicy: this.childPolicy,
      ...params,
    };
    return event;
  }

  createCompletedEvent(params: Partial<WorkflowExecutionCompletedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionCompleted);
    event.workflowExecutionCompletedEventAttributes = {
      decisionTaskCompletedEventId: this.currentEventId - 2,
      ...params,
    };
    return event;
  }

  createCancelRequestedEvent(params: Partial<WorkflowExecutionCancelRequestedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionCancelRequested);
    event.workflowExecutionCancelRequestedEventAttributes = {
      cause: 'test cause',
      externalInitiatedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createCanceledEvent(params: Partial<WorkflowExecutionCanceledEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionCanceled);
    event.workflowExecutionCanceledEventAttributes = {
      decisionTaskCompletedEventId: this.currentEventId - 1,
      details: 'test details',
      ...params,
    };
    return event;
  }

  createCancelFailedEvent(params: Partial<CancelWorkflowExecutionFailedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.CancelWorkflowExecutionFailed);
    event.cancelWorkflowExecutionFailedEventAttributes = {
      cause: 'test cause',
      decisionTaskCompletedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createCompleteFailedEvent(params: Partial<CompleteWorkflowExecutionFailedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.CompleteWorkflowExecutionFailed);
    event.completeWorkflowExecutionFailedEventAttributes = {
      cause: 'test cause',
      decisionTaskCompletedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createFailedEvent(params: Partial<WorkflowExecutionFailedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionFailed);
    event.workflowExecutionFailedEventAttributes = {
      details: 'test details',
      reason: 'test reason',
      decisionTaskCompletedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createFailFailedEvent(params: Partial<FailWorkflowExecutionFailedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.FailWorkflowExecutionFailed);
    event.failWorkflowExecutionFailedEventAttributes = {
      cause: 'test cause',
      decisionTaskCompletedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createTimedOutEvent(params: Partial<WorkflowExecutionTimedOutEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionTimedOut);
    event.workflowExecutionTimedOutEventAttributes = {
      timeoutType: 'START_TO_CLOSE',
      childPolicy: 'TERMINATE',
      ...params,
    };
    return event;
  }


  createContinuedAsNewEvent(params: Partial<WorkflowExecutionContinuedAsNewEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionContinuedAsNew);
    event.workflowExecutionContinuedAsNewEventAttributes = {
      workflowType: this.workflowType,
      taskList: this.taskList,
      childPolicy: this.childPolicy,
      newExecutionRunId: 'new execution run id',
      decisionTaskCompletedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createContinueAsNewFailedEvent(params: Partial<ContinueAsNewWorkflowExecutionFailedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.ContinueAsNewWorkflowExecutionFailed);
    event.continueAsNewWorkflowExecutionFailedEventAttributes = {
      cause: 'test cause',
      decisionTaskCompletedEventId: this.currentEventId - 1,
      ...params,
    };
    return event;
  }

  createTerminatedEvent(params: Partial<WorkflowExecutionTerminatedEventAttributes>): HistoryEvent {
    const event = this.createHistoryEvent(EventType.WorkflowExecutionTerminated);
    event.workflowExecutionTerminatedEventAttributes = {
      childPolicy: this.childPolicy,
      cause: 'test cause',
      details: 'test details',
      reason: 'test reason',
      ...params,
    };
    return event;
  }
}
