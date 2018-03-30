import { HistoryEventProcessor } from '../../core/context/state-machines/history-event-state-machines/history-event-state-machine';
import { ScheduleActivityTaskDecisionAttributes, HistoryEvent, DecisionTask } from '../../aws/aws.types';
import { DecisionRunContext } from '../../core/context/decision-run-context';
import { BaseActivityDecisionStateMachine } from '../../core/context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import { WorkflowExecution } from '../../core/context/state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution';

export class MockDecisionRunContext implements DecisionRunContext {
  getZone(): Zone {
    return undefined;
  }

  processEventList(decisionTask: DecisionTask): void {
  }

  scheduleActivity(attributes: ScheduleActivityTaskDecisionAttributes): BaseActivityDecisionStateMachine {
    return null;
  }

  getStateMachines(): HistoryEventProcessor<any>[] {
    return null;
  }

  getNextId(): string {
    return null;
  }

  getWorkflowExecution(): WorkflowExecution {
    return null;
  }
}
