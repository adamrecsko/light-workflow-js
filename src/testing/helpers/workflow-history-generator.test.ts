import { suite, test } from 'mocha-typescript';
import { EventType } from '../../aws/workflow-history/event-types';
import { WorkflowHistoryGenerator } from './workflow-history-generator';
import { expectHistoryEvent } from './event-utils';

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
    expectHistoryEvent(event, {
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
    expectHistoryEvent(event, {
      eventType: EventType.WorkflowExecutionCompleted,
      params: {
        decisionTaskCompletedEventId: this.historyGenerator.currentEventId - 2,
        ...params,
      },
      eventId: this.historyGenerator.currentEventId - 1,
    });
  }

}