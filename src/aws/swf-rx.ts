import {SWF} from "aws-sdk";
import {Swf} from "aws-sdk";
import {Observable, Observer} from "rxjs/Rx";
import {ActivityPollParameters} from "./aws.types";



export function fromSwfFunction<T>(fnc:<T>(params:any, cb:(error:any, data:T)=>void)=>any, params:any):Observable<T> {
    return Observable.create((obs:Observer<T>)=> {
        function handler(error:any, data:T) {
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


export class SwfRx {
    constructor(private swfClient:SWF) {

    }

    pollForActivityTask(params:ActivityPollParameters):Observable<Swf.ActivityTask> {
        return fromSwfFunction<Swf.ActivityTask>(this.swfClient.pollForActivityTask, params);
    }

    pollForDecisionTask(params:any):Observable<Swf.DecisionTask> {
        return fromSwfFunction<Swf.DecisionTask>(this.swfClient.pollForDecisionTask, params);
    }
}