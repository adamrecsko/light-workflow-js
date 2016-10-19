import {DecisionTask, DecisionPollParameters} from "../aws.types";
import {TeardownLogic} from "rxjs/Subscription";
import {Scheduler} from "rxjs/Scheduler";
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import {SwfRx} from "../swf-rx";

const arrayConcat = [].concat;


export class DecisionTaskRequest extends Observable<DecisionTask> {
    constructor(private decisionPollParameters: DecisionPollParameters,
                private rxSwf: SwfRx,
                private scheduler?: Scheduler) {
        super();
    }


    private getDecisionTask(pollParameters: DecisionPollParameters): Observable<DecisionTask> {
        return this.rxSwf.pollForDecisionTask(pollParameters);
    }

    private static mergeDecisionTaskArray(tasks: DecisionTask[]): DecisionTask {
        const baseEvent = tasks[0];
        if (baseEvent.taskToken) {
            baseEvent.events = arrayConcat.apply([], tasks.map((deTask)=>deTask.events));
            baseEvent.nextPageToken = null;
        }
        return baseEvent;
    }

    private pager(decisionTask: DecisionTask): Observable<DecisionTask> {
        const nextPageToken = decisionTask.nextPageToken;
        if (nextPageToken) {
            return this.getDecisionTask(this.decisionPollParameters.nextPage(nextPageToken))
        } else {
            return Observable.empty();
        }
    }

    protected _subscribe(subscriber: Subscriber<DecisionTask>): TeardownLogic {
        const pollRequest: Observable<DecisionTask> = this.getDecisionTask(this.decisionPollParameters);
        return pollRequest
            .expand((decisionTask: DecisionTask)=>this.pager(decisionTask))
            .toArray()
            .map((list: DecisionTask[])=>DecisionTaskRequest.mergeDecisionTaskArray(list))
            .subscribe(subscriber);
    }
}

