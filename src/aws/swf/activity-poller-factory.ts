import {injectable, inject} from "inversify";
import {WORKFLOW_CLIENT} from "../symbols";
import {ActivityPollParameters, ActivityTask} from "../aws.types";
import {WorkflowClient} from "../workflow-client";
import {TaskPollerObservable} from "./task-poller-observable";


export interface ActivityPollerFactory {
    createPoller(pollParameters: ActivityPollParameters): TaskPollerObservable<ActivityTask>
}

@injectable()
export class GenericActivityPollerFactory implements ActivityPollerFactory {
    constructor(@inject(WORKFLOW_CLIENT) private swfRx: WorkflowClient) {
    }

    createPoller(pollParameters: ActivityPollParameters): TaskPollerObservable<ActivityTask> {
        const req = this.swfRx.pollForActivityTask(pollParameters);
        return new TaskPollerObservable<ActivityTask>(req);
    }
}