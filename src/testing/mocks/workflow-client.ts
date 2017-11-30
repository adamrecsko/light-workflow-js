import {WorkflowClient} from "../../aws/workflow-client";
import {
  ActivityPollParameters, DecisionPollParameters, DecisionTask, Run,
  WorkflowStartParameters
} from "../../aws/aws.types";
import {Observable} from "rxjs/Observable";
import {ActivityTask} from "aws-sdk/clients/swf";

export class MockWorkflowClient implements WorkflowClient {

  pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
    throw new Error('not implemented');
  }

  pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask> {
    throw new Error('not implemented');
  }

  startWorkflow(params: WorkflowStartParameters): Observable<Run> {
    throw new Error('not implemented');
  }
}