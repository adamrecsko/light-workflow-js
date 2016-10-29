import {Kernel} from "inversify";
import {TaskPollerObservable} from "../../aws/swf/task-poller-observable";
import {ActivityTask, TaskList, ActivityPollParameters} from "../../aws/aws.types";
import {ActivityPollerFactory} from "../../aws/swf/activity-poller-factory";

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