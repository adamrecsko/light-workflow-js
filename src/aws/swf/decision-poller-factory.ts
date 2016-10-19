import {injectable, inject} from "inversify";
import {SWF_RX} from "../types";
import {DecisionPollParameters, DecisionTask} from "../aws.types";
import {SwfRx} from "../swf-rx";
import {TaskPollerObservable} from "./task-poller-observable";
import {DecisionTaskRequest} from "./decision-task-request";


export interface DecisionPollerFactory {
    createPoller(pollParameters: DecisionPollParameters): TaskPollerObservable<DecisionTask>
}

@injectable()
export class GenericDecisionPollerFactory implements DecisionPollerFactory {
    constructor(@inject(SWF_RX) private swfRx: SwfRx) {
    }

    createPoller(pollParameters: DecisionPollParameters): TaskPollerObservable<DecisionTask> {
        const req = new DecisionTaskRequest(pollParameters, this.swfRx);
        return new TaskPollerObservable<DecisionTask>(req);
    }
}