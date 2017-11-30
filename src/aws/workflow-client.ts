import {SWF} from "aws-sdk";
import {Observable, Observer} from "rxjs/Rx";
import {
  ActivityPollParameters, DecisionTask, ActivityTask, DecisionPollParameters,
  WorkflowStartParameters, Run
} from "./aws.types";
import {injectable, inject} from "inversify";
import {AWSClientProvider} from "./aws-client-provider";
import {AWS_ADAPTER} from "../symbols";

export interface WorkflowClient {
  pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask>

  pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask>

  startWorkflow(params: WorkflowStartParameters): Observable<Run>
}

@injectable()
export class BaseWorkflowClient implements WorkflowClient {
  private swfClient: SWF;

  constructor(@inject(AWS_ADAPTER) private awsAdapter: AWSClientProvider) {
    this.swfClient = awsAdapter.getNativeSWFClient();
  }

  pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
    return BaseWorkflowClient.fromSwfFunction<ActivityTask>(this.swfClient.pollForActivityTask.bind(this.swfClient), params);
  }

  pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask> {
    return BaseWorkflowClient.fromSwfFunction<DecisionTask>(this.swfClient.pollForDecisionTask.bind(this.swfClient), params);
  }

  startWorkflow(params: WorkflowStartParameters): Observable<Run> {
    return BaseWorkflowClient.fromSwfFunction<Run>(this.swfClient.startWorkflowExecution.bind(this.swfClient), params);
  }


  public static fromSwfFunction<T>(fnc: <T>(params: any, cb: (error: any, data: T) => void) => any, params: any): Observable<T> {
    return Observable.create((obs: Observer<T>) => {
      function handler(error: any, data: T) {
        if (error) {
          console.log(error);
          obs.error(error);
        } else {
          obs.next(data);
          obs.complete();
        }
      }

      try {
        fnc(params, handler);
      } catch (e) {
        obs.error(e);
      }
    });
  }
}