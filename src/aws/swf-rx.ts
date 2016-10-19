import {SWF} from "aws-sdk";
import {Observable, Observer} from "rxjs/Rx";
import {ActivityPollParameters, DecisionTask, ActivityTask, DecisionPollParameters} from "./aws.types";
import {injectable, inject} from "inversify";
import {AWS_ADAPTER} from "./types";
import {AWSAdapter} from "./aws-adapter";

export interface SwfRx {
    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask>
    pollForDecisionTask(params: DecisionPollParameters): Observable<DecisionTask>
}


@injectable()
export class GenericSwfRx implements SwfRx {
    private swfClient: SWF;

    constructor(@inject(AWS_ADAPTER) private awsAdapter: AWSAdapter) {
        this.swfClient = awsAdapter.getNativeSWFClient();
    }

    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
        return GenericSwfRx.fromSwfFunction<ActivityTask>(this.swfClient.pollForActivityTask, params);
    }

    pollForDecisionTask(params: any): Observable<DecisionTask> {
        return GenericSwfRx.fromSwfFunction<DecisionTask>(this.swfClient.pollForDecisionTask, params);
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