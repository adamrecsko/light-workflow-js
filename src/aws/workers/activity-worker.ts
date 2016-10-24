import {TaskList, ActivityTask, ActivityPollParameters} from "../aws.types";
import {WorkflowClient} from "../workflow-client";
import {ActivityPollerFactory} from "../swf/activity-poller-factory";
import {TaskPollerObservable} from "../swf/task-poller-observable";
import {ActivityDefinition, getActivityDefinitionsFromClass} from "../decorators/activity/activity-decorators";
import {Kernel} from "inversify";


export interface ActivityWorker {

}

export class GenericActivityWorker implements ActivityWorker {
    private activityPoller: TaskPollerObservable<ActivityTask>;

    constructor(private domain: string,
                private taskList: TaskList,
                private activityPollerFactory: ActivityPollerFactory) {
        this.activityPoller = this.activityPollerFactory
            .createPoller(new ActivityPollParameters(domain, taskList));
    }


}