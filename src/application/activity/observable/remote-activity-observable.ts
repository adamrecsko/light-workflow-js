import {Observable, Subscriber} from "rxjs";
import {DecisionRunContext} from "../../context/decision-run-context";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {ActivityDecisionStateMachine} from "../../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
import {TeardownLogic} from "rxjs/Subscription";
import {ActivityDecisionState} from "../../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
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

export class RemoteActivityObservable extends Observable<String> {
    public activityDecisionStateMachine: ActivityDecisionStateMachine;

    constructor(private decisionContext: DecisionRunContext,
                private scheduleParameters: ScheduleActivityTaskDecisionAttributes) {
        super();
    }

    protected _subscribe(subscriber: Subscriber<String>): TeardownLogic {
        this.activityDecisionStateMachine = this.decisionContext.getOrCreateActivityStateMachine(this.scheduleParameters);
        const subscription = this.activityDecisionStateMachine
            .onChange.subscribe((state: ActivityDecisionState)=> {
                switch (state) {
                    case ActivityDecisionState.ScheduleFailed:
                        subscriber.error(new ScheduleFailedException(this.activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Completed:
                        subscriber.next(this.activityDecisionStateMachine.result);
                        subscriber.complete();
                        break;
                    case ActivityDecisionState.Failed:
                        subscriber.error(new FailedException(this.activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Timeout:
                        subscriber.error(RemoteActivityObservable.createTimeoutException(this.activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Canceled:
                        subscriber.complete();
                        break;
                    case ActivityDecisionState.CancelRequested:
                        break;
                    case ActivityDecisionState.RequestCancelFailed:
                        subscriber.error(new RequestCancelFailedException(this.activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Created:
                    case ActivityDecisionState.CanceledBeforeSent:
                    case ActivityDecisionState.Sending:
                    case ActivityDecisionState.Sent:
                    case ActivityDecisionState.CancelledAfterSent:
                    case ActivityDecisionState.Scheduled:
                    case ActivityDecisionState.Started:
                        // DO NOTHING
                        break;

                    default:
                        throw new UnknownStateException(`ActivityDecisionStateMachine is in unknown state: ${state}`);
                }
            });
        return ()=> {
            //TODO: CANCEL ACTIVITY ?
            subscription.unsubscribe();
        };
    }

    private static createTimeoutException(stateMachine: ActivityDecisionStateMachine): TimeoutException {
        switch (stateMachine.timeoutType) {
            case ActivityTimeoutType.START_TO_CLOSE:
                return new StartToCloseTimeoutException(stateMachine);
            case ActivityTimeoutType.SCHEDULE_TO_START:
                return new ScheduleToStartTimeoutException(stateMachine);
            case ActivityTimeoutType.SCHEDULE_TO_CLOSE:
                return new ScheduleToCloseTimeoutException(stateMachine);
            case ActivityTimeoutType.HEARTBEAT:
                return new HeartbeatTimeoutException(stateMachine);
        }
        return null;
    }
}