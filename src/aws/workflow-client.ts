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
import { LOGGER, Logger } from '../core/logging/logger';

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

  private readonly swfClient: SWF;

  constructor(@inject(AWS_ADAPTER) private awsAdapter: AWSClientProvider, @inject(LOGGER) private logger: Logger) {
    this.swfClient = awsAdapter.getNativeSWFClient();
  }

  pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
    return this.fromSwfFunction<ActivityTask>(this.swfClient.pollForActivityTask.bind(this.swfClient), params);
  }

  pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask> {
    return this.fromSwfFunction<DecisionTask>(this.swfClient.pollForDecisionTask.bind(this.swfClient), params);
  }

  startWorkflow(params: WorkflowStartParameters): Observable<Run> {
    return this.fromSwfFunction<Run>(this.swfClient.startWorkflowExecution.bind(this.swfClient), params);
  }

  registerWorkflowType(params: RegisterWorkflowTypeInput): Observable<RegisterWorkflowTypeInput> {
    return this.fromSwfFunction<RegisterWorkflowTypeInput>(this.swfClient.registerWorkflowType.bind(this.swfClient), params);
  }

  registerActivityType(params: RegisterActivityTypeInput): Observable<RegisterActivityTypeInput> {
    return this.fromSwfFunction<RegisterActivityTypeInput>(this.swfClient.registerActivityType.bind(this.swfClient), params);
  }

  respondDecisionTaskCompleted(params: RespondDecisionTaskCompletedInput): Observable<{}> {
    return this.fromSwfFunction(this.swfClient.respondDecisionTaskCompleted.bind(this.swfClient), params);
  }

  respondActivityTaskCompleted(params: RespondActivityTaskCompletedInput): Observable<{}> {
    return this.fromSwfFunction(this.swfClient.respondActivityTaskCompleted.bind(this.swfClient), params);
  }

  respondActivityTaskFailed(params: RespondActivityTaskFailedInput): Observable<{}> {
    return this.fromSwfFunction(this.swfClient.respondActivityTaskFailed.bind(this.swfClient), params);
  }


  public fromSwfFunction<T>(fnc: <T>(params: any, cb: (error: any, data: T) => void) => any, params: any): Observable<T> {
    return Observable.create((obs: Observer<T>) => {

      this.logger.debug('AWS request: %s, with %j params in progress', fnc.name, params);

      const handler = (error: any, data: T) => {
        if (error) {
          this.logger.debug('AWS request error: %s, error: %s', fnc.name, error);
          obs.error(error);
        } else {
          this.logger.debug('AWS request completed: %s, with %j result', fnc.name, data);
          obs.next(data);
          obs.complete();
        }
      };

      try {
        fnc(params, handler);
      } catch (e) {
        this.logger.debug('Internal error "%s", error: "%s"', fnc.name, e);
        obs.error(e);
      }
    });
  }
}
