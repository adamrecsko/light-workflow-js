import { WorkflowClient } from '../../aws/workflow-client';
import {
  ActivityPollParameters, DecisionPollParameters, DecisionTask, RegisterWorkflowTypeInput, Run,
  WorkflowStartParameters,
} from '../../aws/aws.types';
import { Observable } from 'rxjs/Observable';
import { ActivityTask, RespondDecisionTaskCompletedInput } from 'aws-sdk/clients/swf';

export class MockWorkflowClient implements WorkflowClient {
  respondDecisionTaskCompleted(params: RespondDecisionTaskCompletedInput): Observable<{}> {
    throw new Error('not implemented');
  }

  pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
    throw new Error('not implemented');
  }

  pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask> {
    throw new Error('not implemented');
  }

  startWorkflow(params: WorkflowStartParameters): Observable<Run> {
    throw new Error('not implemented');
  }

  registerWorkflowType(params: RegisterWorkflowTypeInput): Observable<RegisterWorkflowTypeInput> {
    throw new Error('not implemented');
  }


}
