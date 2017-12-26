import { suite, test } from 'mocha-typescript';
import { WorkflowExecution } from './workflow-execution';
import { HistoryGenerator } from '../../../../../testing/helpers/history-event-generator';
import { EventType } from '../../../../../aws/workflow-history/event-types';
import { expect } from 'chai';
import { WorkflowExecutionStates } from './workflow-execution-states';
import { WorkflowHistoryGenerator } from '../../../../../testing/helpers/workflow-history-generator';

@suite
class WorkflowExecutionTest {
  private stateMachine: WorkflowExecution;
  private historyGenerator: WorkflowHistoryGenerator;

  before() {
    this.stateMachine = new WorkflowExecution();
    this.historyGenerator = new WorkflowHistoryGenerator();
  }

  @test
  shouldTransitionToStarted() {
    const event = this.historyGenerator.createStartedEvent({
      input: 'test-input',
    });
    this.stateMachine.processHistoryEvent(event);
    expect(this.stateMachine.currentState).to.eq(WorkflowExecutionStates.Started);
    expect(this.stateMachine.input).to.eq('test-input');
  }

  @test
  shouldTransitionToCompleted() {
    const event = this.historyGenerator.createCompletedEvent({
      result: 'test-result',
    });
    this.stateMachine.currentState = WorkflowExecutionStates.Started;
    this.stateMachine.processHistoryEvent(event);
    expect(this.stateMachine.currentState).to.eq(WorkflowExecutionStates.Completed);
    expect(this.stateMachine.result).to.eq('test-result');
  }
}