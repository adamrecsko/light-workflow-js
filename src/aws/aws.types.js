"use strict";
class TaskList {
}
exports.TaskList = TaskList;
class ActivityDefinition {
}
exports.ActivityDefinition = ActivityDefinition;
class ActivityPollParameters {
    constructor(domain, taskList, identity) {
        this.domain = domain;
        this.taskList = taskList;
        this.identity = identity;
    }
}
exports.ActivityPollParameters = ActivityPollParameters;
class DecisionPollParameters {
    copy() {
        const result = new DecisionPollParameters();
        result.domain = this.domain;
        result.taskList = this.taskList;
        result.identity = this.identity;
        result.maximumPageSize = this.maximumPageSize;
        result.nextPageToken = this.nextPageToken;
        result.reverseOrder = this.reverseOrder;
        return result;
    }
    nextPage(nextPageToken) {
        const result = this.copy();
        result.nextPageToken = nextPageToken;
        return result;
    }
}
exports.DecisionPollParameters = DecisionPollParameters;
//# sourceMappingURL=aws.types.js.map