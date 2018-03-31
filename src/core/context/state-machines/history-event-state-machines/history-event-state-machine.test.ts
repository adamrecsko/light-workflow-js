import { suite, test } from 'mocha-typescript';
import { AbstractHistoryEventStateMachine, UnprocessableEventException } from './history-event-state-machine';
import { TransitionTable } from '../state-machine';
import { HistoryEvent } from '../../../../aws/aws.types';
import { HistoryGenerator } from '../../../../testing/helpers/history-event-generator';
import { EventType } from '../../../../aws/workflow-history/event-types';
import { expect } from 'chai';


enum TestStates {
  test1 = 1,
  test2,
  test3,
}

const TEST_TRANSITION_TABLE: TransitionTable<TestStates> = [
  [TestStates.test1, TestStates.test2],
  [TestStates.test2, TestStates.test3],
];


class TestHistoryEventProcessor extends AbstractHistoryEventStateMachine<TestStates> {
  public processCount: number = 0;

  constructor(currentState?: TestStates) {
    super(TEST_TRANSITION_TABLE, currentState);
  }

  protected processEvent(eventType: EventType, event: HistoryEvent): void {
    this.processCount++;
    switch (eventType) {
      case EventType.WorkflowExecutionStarted:
        this.goTo(TestStates.test2);
        break;

      default:
        throw new Error('unknown event type');
    }
  }
}

@suite
class AbstractHistoryEventProcessorTest {
  private testEventProcessor: TestHistoryEventProcessor;
  private historyEventGenerator: HistoryGenerator;

  before() {
    this.testEventProcessor = new TestHistoryEventProcessor(TestStates.test1);
    this.historyEventGenerator = new HistoryGenerator();
  }

  @test initialStateMustBeTheGivenState() {
    expect(this.testEventProcessor.currentState).to.eq(TestStates.test1);
  }

  @test processEvent() {
    const historyEvent: HistoryEvent = this.historyEventGenerator
      .createHistoryEvent(EventType.WorkflowExecutionStarted);
    this.testEventProcessor.processHistoryEvent(historyEvent);
    expect(this.testEventProcessor.currentState).to.eq(TestStates.test2);
  }

  @test shouldNotProcessSameEventTwice() {
    const historyEvent: HistoryEvent = this.historyEventGenerator
      .createHistoryEvent(EventType.WorkflowExecutionStarted);
    this.testEventProcessor.processHistoryEvent(historyEvent);
    this.testEventProcessor.processHistoryEvent(historyEvent);
    expect(this.testEventProcessor.processCount).to.eq(1);
  }

  @test throwErrorIfEventIsUnprocessable() {
    const historyEvent: HistoryEvent = this.historyEventGenerator
      .createHistoryEvent(EventType.ActivityTaskScheduled);
    expect(() => {
      this.testEventProcessor.processHistoryEvent(historyEvent);
    }).to.throw(UnprocessableEventException);
  }
}
