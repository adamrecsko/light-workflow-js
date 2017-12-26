import { HistoryGenerator } from './history-event-generator';
import { HistoryEvent, TaskList } from '../../aws/aws.types';
import { EventType } from '../../aws/workflow-history/event-types';


import {
  CancelWorkflowExecutionFailedEventAttributes, ChildPolicy, CompleteWorkflowExecutionFailedEventAttributes,
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

}
