import { suite, test } from 'mocha-typescript';
import { WorkflowExecution } from './workflow-execution';
import * as chai from 'chai';
import { WorkflowExecutionStates as States } from './workflow-execution-states';
import { WorkflowHistoryGenerator } from '../../../../../testing/helpers/workflow-history-generator';

chai.use(require('chai-shallow-deep-equal'));
const expect = chai.expect;


@suite
class WorkflowExecutionTest {
  private stateMachine: WorkflowExecution;
  private historyGenerator: WorkflowHistoryGenerator;

  expectStateMachine(currentState: States, params: any) {
    expect(this.stateMachine.currentState).to.eq(
      currentState,
      `Current state "${States[this.stateMachine.currentState]}" does not match "${States[currentState]}"`);
    (<any>expect(this.stateMachine).to).shallowDeepEqual(params);
  }

  applyStatesToStateMachine(states: States[]): void {
    states.forEach(state => this.stateMachine.currentState = state);
  }

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
    expect(this.stateMachine.currentState).to.eq(States.Started);
    expect(this.stateMachine.input).to.eq('test-input');
  }

  @test
  shouldTransitionToCompleted() {

    const params = {
      result: 'test-result',
    };
    const event = this.historyGenerator.createCompletedEvent(params);
    this.stateMachine.currentState = States.Started;
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.Completed, params);
  }

  @test
  shouldTransitionToCancelRequested() {
    const params = {
      cause: 'test cause',
    };
    const event = this.historyGenerator.createCancelRequestedEvent(params);
    this.stateMachine.currentState = States.Started;
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.CancelRequested, params);
  }

  @test
  shouldTransitionToCancelFailed() {
    const params = {
      cause: 'test cause',
    };
    const event = this.historyGenerator.createCancelFailedEvent(params);
    this.applyStatesToStateMachine([States.Started, States.CancelRequested]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.CancelFailed, params);
  }

  @test
  shouldTransitionToCompleteFailed() {
    const params = {
      cause: 'test cause',
    };
    const event = this.historyGenerator.createCompleteFailedEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.CompleteFailed, params);
  }

  @test
  shouldTransitionToFailed() {
    const params = {
      reason: 'test reason',
    };
    const event = this.historyGenerator.createFailedEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.ExecutionFailed, params);
  }

  @test
  shouldTransitionToFailFailed() {
    const params = {
      cause: 'test reason',
    };
    const event = this.historyGenerator.createFailFailedEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.FailFailed, params);
  }

  @test
  shouldTransitionToTimedOut() {
    const params = {
      timeoutType: 'test timeout type',
    };
    const event = this.historyGenerator.createTimedOutEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.TimedOut, params);
  }

  @test
  shouldTransitionToContinuedAsNew() {
    const params = {
      input: 'test input 2',
    };
    const event = this.historyGenerator.createContinuedAsNewEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.ContinuedAsNew, params);
  }

  @test
  shouldTransitionToContinueAsNewFailed() {
    const params = {
      cause: 'my test cause',
    };
    const event = this.historyGenerator.createContinueAsNewFailedEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.ContinueAsNewFailed, params);
  }

  @test
  shouldTransitionToTerminated() {
    const params = {
      cause: 'my test cause',
    };
    const event = this.historyGenerator.createTerminatedEvent(params);
    this.applyStatesToStateMachine([States.Started]);
    this.stateMachine.processHistoryEvent(event);
    this.expectStateMachine(States.Terminated, params);
  }
}