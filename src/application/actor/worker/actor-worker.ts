import {TaskPollerObservable} from "../../../aws/swf/task-poller-observable";
import {ActivityTask, TaskList, ActivityPollParameters} from "../../../aws/aws.types";
import {ActivityPollerFactory} from "../../../aws/swf/activity-poller-factory";


export interface ActorWorker {
}

export class BaseActorWorker implements ActorWorker {
    private activityPoller: TaskPollerObservable<ActivityTask>;

    constructor(private domain: string,
                private taskList: TaskList,
                private activityPollerFactory: ActivityPollerFactory) {
        this.activityPoller = this.activityPollerFactory
            .createPoller(new ActivityPollParameters(domain, taskList));
    }
}