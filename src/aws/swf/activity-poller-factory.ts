import {injectable, inject} from "inversify";
import {SWF_RX} from "../types";
import {ActivityPollParameters, ActivityTask} from "../aws.types";
import {SwfRx} from "../swf-rx";
import {TaskPollerObservable} from "./task-poller-observable";


export interface ActivityPollerFactory {
    createPoller(pollParameters: ActivityPollParameters): TaskPollerObservable<ActivityTask>
}

@injectable()
export class GenericActivityPollerFactory implements ActivityPollerFactory {
    constructor(@inject(SWF_RX) private swfRx: SwfRx) {
    }
    createPoller(pollParameters: ActivityPollParameters): TaskPollerObservable<ActivityTask> {
        const req = this.swfRx.pollForActivityTask(pollParameters);
        return new TaskPollerObservable<ActivityTask>(req);
    }
}