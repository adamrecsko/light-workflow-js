import {SWF} from "aws-sdk";
import {Observable, Observer} from "rxjs/Rx";
import {ActivityPollParameters, DecisionTask, ActivityTask, DecisionPollParameters} from "./aws.types";
import {injectable, inject} from "inversify";
import {AWSClientProvider} from "./aws-client-provider";
import {AWS_ADAPTER} from "../symbols";

export interface WorkflowClient {
    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask>
    pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask>
}

@injectable()
export class BaseWorkflowClient implements WorkflowClient {
    private swfClient: SWF;

    constructor(@inject(AWS_ADAPTER) private awsAdapter: AWSClientProvider) {
        this.swfClient = awsAdapter.getNativeSWFClient();
    }

    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
        return BaseWorkflowClient.fromSwfFunction<ActivityTask>(this.swfClient.pollForActivityTask, params);
    }

    pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask> {
        return BaseWorkflowClient.fromSwfFunction<DecisionTask>(this.swfClient.pollForDecisionTask, params);
    }


    public static fromSwfFunction<T>(fnc: <T>(params: any, cb: (error: any, data: T)=>void)=>any, params: any): Observable<T> {
        return Observable.create((obs: Observer<T>)=> {
            function handler(error: any, data: T) {
                if (error) {
                    obs.error(error);
                    obs.complete();
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