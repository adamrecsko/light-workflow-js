import {Observable, Subscriber} from "rxjs";
import {DecisionRunContext} from "../../context/decision-run-context";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {ActivityDecisionStateMachine} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision";
import {TeardownLogic} from "rxjs/Subscription";
import {ActivityDecisionState} from "../../state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision-states";
import {ActivityTimeoutType} from "../../../aws/workflow-history/activity-timeout-type";
import {
    ScheduleFailedException, FailedException,
    RequestCancelFailedException, UnknownStateException, TimeoutException, StartToCloseTimeoutException,
    ScheduleToStartTimeoutException, ScheduleToCloseTimeoutException, HeartbeatTimeoutException
} from "./remote-activity-observable-exceptions";
import {ObservableFactory} from "../../application/observable-factory";
import {Serializer} from "../../application/serializer";


export class RemoteActivityObservable extends Observable<String> {

    constructor(private decisionContext: DecisionRunContext,
                private scheduleParameters: ScheduleActivityTaskDecisionAttributes,
                private serializer: Serializer) {
        super();
    }

    protected _subscribe(subscriber: Subscriber<String>): TeardownLogic {
        const activityDecisionStateMachine: ActivityDecisionStateMachine = this.decisionContext
            .getOrCreateActivityStateMachine(this.scheduleParameters);
        const subscription = activityDecisionStateMachine
            .onChange.subscribe((state: ActivityDecisionState)=> {
                switch (state) {
                    case ActivityDecisionState.ScheduleFailed:
                        subscriber.error(new ScheduleFailedException(activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Completed:

                        try {
                            subscriber.next(this.serializer.parse(activityDecisionStateMachine.result));
                            subscriber.complete();
                        } catch (e) {
                            subscriber.error(e);
                        }

                        break;
                    case ActivityDecisionState.Failed:
                        subscriber.error(new FailedException(activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Timeout:
                        subscriber.error(RemoteActivityObservable.createTimeoutException(activityDecisionStateMachine));
                        break;
                    case ActivityDecisionState.Canceled:
                        subscriber.complete();
                        break;
                    case ActivityDecisionState.CancelRequested:
                        break;
                    case ActivityDecisionState.RequestCancelFailed:
                        subscriber.error(new RequestCancelFailedException(activityDecisionStateMachine));
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


export interface RemoteObservableFactory {
    create(decisionContext: DecisionRunContext,
           scheduleParameters: ScheduleActivityTaskDecisionAttributes, serializer: Serializer): RemoteActivityObservable;
}

export class DefaultRemoteObservableFactory implements RemoteObservableFactory {
    public create(decisionContext: DecisionRunContext,
                  scheduleParameters: ScheduleActivityTaskDecisionAttributes,
                  serializer: Serializer): RemoteActivityObservable {
        return new RemoteActivityObservable(decisionContext, scheduleParameters, serializer);
    }
}

