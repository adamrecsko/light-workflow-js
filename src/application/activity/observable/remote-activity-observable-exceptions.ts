import {ActivityDecisionStateMachine} from "../../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
import {ActivityTimeoutType} from "../../../aws/workflow-history/activity-timeout-type";
export class ScheduleFailedException extends Error {
    public cause: string;

    constructor(public stateMachine: ActivityDecisionStateMachine) {
        super(`Activity schedule failed: ${stateMachine.cause}`);
        this.cause = stateMachine.cause;
    }
}

export class FailedException extends Error {
    public reason: string;
    public details: string;

    constructor(public stateMachine: ActivityDecisionStateMachine) {
        super(`Activity failed: ${stateMachine.reason} - ${stateMachine.details}`);
        this.reason = stateMachine.reason;
        this.details = stateMachine.details;
    }
}

export class TimeoutException extends Error {
    public timeoutType: ActivityTimeoutType;
    public details: string;

    constructor(public stateMachine: ActivityDecisionStateMachine) {
        super(`Activity timed out: ${stateMachine.timeoutType} - ${stateMachine.details}`);
        this.timeoutType = stateMachine.timeoutType;
        this.details = stateMachine.details;
    }
}

export class StartToCloseTimeoutException extends TimeoutException {
}
export class ScheduleToStartTimeoutException extends TimeoutException {
}
export class ScheduleToCloseTimeoutException extends TimeoutException {
}
export class HeartbeatTimeoutException extends TimeoutException {
}


export class RequestCancelFailedException extends Error {
    public cause: string;

    constructor(private stateMachine: ActivityDecisionStateMachine) {
        super(`Cancel request failed: ${stateMachine.cause}`);
        this.cause = stateMachine.cause;
    }
}


export class UnknownStateException extends Error {
    constructor(message: string) {
        super(message);
    }
}