import { DecisionTask } from '../../aws/aws.types';

export interface WorkflowDecisionPollGenerator {

  generateTask(): DecisionTask;

}

export class BaseWorkflowDecisionPollGenerator {

}
