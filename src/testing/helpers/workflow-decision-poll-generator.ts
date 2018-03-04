import { DecisionTask, HistoryEvent } from '../../aws/aws.types';
import * as faker from 'faker';

export interface WorkflowDecisionPollGenerator {
  generateTask(decisionTask: Partial<DecisionTask>): DecisionTask;
}

export class BaseWorkflowDecisionPollGenerator implements WorkflowDecisionPollGenerator {
  generateTask(decisionTask: Partial<DecisionTask> = {}): DecisionTask {
    return {
      workflowType: {
        name: faker.hacker.ingverb(),
        version: faker.system.semver(),
      },
      events: [],
      nextPageToken: faker.random.uuid(),
      taskToken: faker.random.uuid(),
      startedEventId: faker.random.number(),
      workflowExecution: {
        runId: faker.random.uuid(),
        workflowId: `${faker.random.number()}`,
      },
      ...decisionTask,
    };
  }
}
