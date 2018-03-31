import { SWF } from 'aws-sdk';
import { Observable, Observer } from 'rxjs/Rx';
import {
  ActivityPollParameters, DecisionTask, ActivityTask, DecisionPollParameters,
  WorkflowStartParameters, Run, RegisterWorkflowTypeInput,
} from './aws.types';
import { injectable, inject } from 'inversify';
import { AWSClientProvider } from './aws-client-provider';
import { AWS_ADAPTER } from '../symbols';
import { RegisterActivityTypeInput, RespondActivityTaskCompletedInput, RespondActivityTaskFailedInput, RespondDecisionTaskCompletedInput } from 'aws-sdk/clients/swf';

export interface WorkflowClient {
  pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask>;

  pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask>;

  startWorkflow(params: WorkflowStartParameters): Observable<Run>;

  registerWorkflowType(params: RegisterWorkflowTypeInput): Observable<RegisterWorkflowTypeInput>;

  registerActivityType(params: RegisterActivityTypeInput): Observable<RegisterActivityTypeInput>;

  respondDecisionTaskCompleted(params: RespondDecisionTaskCompletedInput): Observable<{}>;

  respondActivityTaskCompleted(params: RespondActivityTaskCompletedInput): Observable<{}>;

  respondActivityTaskFailed(params: RespondActivityTaskFailedInput): Observable<{}>;
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

  registerWorkflowType(params: RegisterWorkflowTypeInput): Observable<RegisterWorkflowTypeInput> {
    return BaseWorkflowClient.fromSwfFunction<RegisterWorkflowTypeInput>(this.swfClient.registerWorkflowType.bind(this.swfClient), params);
  }

  registerActivityType(params: RegisterActivityTypeInput): Observable<RegisterActivityTypeInput> {
    return BaseWorkflowClient.fromSwfFunction<RegisterActivityTypeInput>(this.swfClient.registerActivityType.bind(this.swfClient), params);
  }

  respondDecisionTaskCompleted(params: RespondDecisionTaskCompletedInput): Observable<{}> {
    return BaseWorkflowClient.fromSwfFunction(this.swfClient.respondDecisionTaskCompleted.bind(this.swfClient), params);
  }

  respondActivityTaskCompleted(params: RespondActivityTaskCompletedInput): Observable<{}> {
    return BaseWorkflowClient.fromSwfFunction(this.swfClient.respondActivityTaskCompleted.bind(this.swfClient), params);
  }

  respondActivityTaskFailed(params: RespondActivityTaskFailedInput): Observable<{}> {
    return BaseWorkflowClient.fromSwfFunction(this.swfClient.respondActivityTaskFailed.bind(this.swfClient), params);
  }



  public static fromSwfFunction<T>(fnc: <T>(params: any, cb: (error: any, data: T) => void) => any, params: any): Observable<T> {
    return Observable.create((obs: Observer<T>) => {
      function handler(error: any, data: T) {
        if (error) {
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
