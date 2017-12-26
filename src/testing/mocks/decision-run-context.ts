import { HistoryEventProcessor } from '../../core/context/state-machines/history-event-state-machines/history-event-state-machine';
import { ScheduleActivityTaskDecisionAttributes, HistoryEvent, DecisionTask } from '../../aws/aws.types';
import { DecisionRunContext } from '../../core/context/decision-run-context';
import { BaseActivityDecisionStateMachine } from '../../core/context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';

export class MockDecisionRunContext implements DecisionRunContext {
  processEventList(decisionTask: DecisionTask): void {
  }

  getOrCreateActivityStateMachine(attributes: ScheduleActivityTaskDecisionAttributes): BaseActivityDecisionStateMachine {
    return null;
  }

  getStateMachines(): HistoryEventProcessor<any>[] {
    return null;
  }

  getNextId(): string {
    return null;
  }
}
