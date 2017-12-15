import { DecisionTask, HistoryEvent } from '../../aws/aws.types';


export interface WorkflowDecisionPollGenerator {
  generateTask(eventList: HistoryEvent[]): DecisionTask;
}

export class BaseWorkflowDecisionPollGenerator implements WorkflowDecisionPollGenerator {
  generateTask(eventList: HistoryEvent[]): DecisionTask {





    return null;
  }
}
