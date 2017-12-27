import { suite, test } from 'mocha-typescript';
import { EventType } from '../../aws/workflow-history/event-types';
import { WorkflowHistoryGenerator } from './workflow-history-generator';
import { expectHistoryEvent } from './event-utils';
import {
  CancelWorkflowExecutionFailedEventAttributes, CompleteWorkflowExecutionFailedEventAttributes, ContinueAsNewWorkflowExecutionFailedEventAttributes,
  FailWorkflowExecutionFailedEventAttributes,
  WorkflowExecutionCanceledEventAttributes,
  WorkflowExecutionCancelRequestedEventAttributes, WorkflowExecutionCompletedEventAttributes, WorkflowExecutionContinuedAsNewEventAttributes,
  WorkflowExecutionFailedEventAttributes,
  WorkflowExecutionStartedEventAttributes, WorkflowExecutionTerminatedEventAttributes, WorkflowExecutionTimedOutEventAttributes
} from 'aws-sdk/clients/swf';

@suite
class WorkflowHistoryGeneratorTest {
  private historyGenerator: WorkflowHistoryGenerator;

  before() {
    this.historyGenerator = new WorkflowHistoryGenerator();
  }

  @test
  shouldCreateWorkflowStartedEvent() {
    const params = {
      input: 'test-input',
    };
    const event = this.historyGenerator.createStartedEvent(params);
    expectHistoryEvent<WorkflowExecutionStartedEventAttributes>(event, {
      eventType: EventType.WorkflowExecutionStarted,
      params: {
        workflowType: this.historyGenerator.workflowType,
        taskList: this.historyGenerator.taskList,
        childPolicy: this.historyGenerator.childPolicy,
        ...params,
      },
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowCompletedEvent() {
    const params = {
      result: 'test-result',
    };
    const event = this.historyGenerator.createCompletedEvent(params);
    expectHistoryEvent<WorkflowExecutionCompletedEventAttributes>(event, {
      eventType: EventType.WorkflowExecutionCompleted,
      params: {
        decisionTaskCompletedEventId: this.historyGenerator.currentEventId - 2,
        ...params,
      },
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowCancelRequestedEvent() {
    const params = {
      cause: 'my example test cause',
    };
    const event = this.historyGenerator.createCancelRequestedEvent(params);
    expectHistoryEvent<WorkflowExecutionCancelRequestedEventAttributes>(event, {
      params,
      eventType: EventType.WorkflowExecutionCancelRequested,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowCanceledEvent() {
    const params = {
      details: 'my test details',
    };
    const event = this.historyGenerator.createCanceledEvent(params);
    expectHistoryEvent<WorkflowExecutionCanceledEventAttributes>(event, {
      params,
      eventType: EventType.WorkflowExecutionCanceled,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowCancelFailedEvent() {
    const params = {
      cause: 'my test cause',
    };
    const event = this.historyGenerator.createCancelFailedEvent(params);
    expectHistoryEvent<CancelWorkflowExecutionFailedEventAttributes>(event, {
      params,
      eventType: EventType.CancelWorkflowExecutionFailed,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowCompleteFailedEvent() {
    const params = {
      cause: 'my test cause',
    };
    const event = this.historyGenerator.createCompleteFailedEvent(params);
    expectHistoryEvent<CompleteWorkflowExecutionFailedEventAttributes>(event, {
      params,
      eventType: EventType.CompleteWorkflowExecutionFailed,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowFailedEvent() {
    const params = {
      reason: 'my test reason',
      details: 'my test details',
    };
    const event = this.historyGenerator.createFailedEvent(params);
    expectHistoryEvent<WorkflowExecutionFailedEventAttributes>(event, {
      params,
      eventType: EventType.WorkflowExecutionFailed,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowFailFailedEvent() {
    const params = {
      cause: 'my test cause',
    };
    const event = this.historyGenerator.createFailFailedEvent(params);
    expectHistoryEvent<FailWorkflowExecutionFailedEventAttributes>(event, {
      params,
      eventType: EventType.FailWorkflowExecutionFailed,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowTimedOutEvent() {
    const params = {};
    const event = this.historyGenerator.createTimedOutEvent(params);
    expectHistoryEvent<WorkflowExecutionTimedOutEventAttributes>(event, {
      params,
      eventType: EventType.WorkflowExecutionTimedOut,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowContinuedAsNewEvent() {
    const params = {
      input: 'my new input',
    };
    const event = this.historyGenerator.createContinuedAsNewEvent(params);
    expectHistoryEvent<WorkflowExecutionContinuedAsNewEventAttributes>(event, {
      params,
      eventType: EventType.WorkflowExecutionContinuedAsNew,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateWorkflowContinueAsNewFailedEvent() {
    const params = {
      cause: 'my test cause',
    };
    const event = this.historyGenerator.createContinueAsNewFailedEvent(params);
    expectHistoryEvent<ContinueAsNewWorkflowExecutionFailedEventAttributes>(event, {
      params,
      eventType: EventType.ContinueAsNewWorkflowExecutionFailed,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

  @test
  shouldCreateTerminatedEvent() {
    const params = {
      cause: 'test cause',
      details: 'test details',
      reason: 'test reason',
      childPolicy: 'TERMINATE',
    };
    const event = this.historyGenerator.createTerminatedEvent(params);
    expectHistoryEvent<WorkflowExecutionTerminatedEventAttributes>(event, {
      params,
      eventType: EventType.WorkflowExecutionTerminated,
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }


}