import {injectable, inject} from "inversify";
import {DecisionPollParameters, DecisionTask} from "../aws.types";
import {WorkflowClient} from "../workflow-client";
import {TaskPollerObservable} from "./task-poller-observable";
import {DecisionTaskRequest} from "./decision-task-request";
import {WORKFLOW_CLIENT} from "../../symbols";


export interface DecisionPollerFactory {
    createPoller(pollParameters: DecisionPollParameters): TaskPollerObservable<DecisionTask>
}

@injectable()
export class GenericDecisionPollerFactory implements DecisionPollerFactory {
    constructor(@inject(WORKFLOW_CLIENT) private swfRx: WorkflowClient) {
    }

    createPoller(pollParameters: DecisionPollParameters): TaskPollerObservable<DecisionTask> {
        const req = new DecisionTaskRequest(pollParameters, this.swfRx);
        return new TaskPollerObservable<DecisionTask>(req);
    }
}