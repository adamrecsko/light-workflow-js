import {TeardownLogic} from "rxjs/Subscription";
import {Scheduler} from "rxjs/Scheduler";
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {DecisionRunContext} from "../../context/decision-run-context";

export class ActivityObservable<T> extends Observable<T> {
    constructor(private attributes: ScheduleActivityTaskDecisionAttributes,
                private context: DecisionRunContext,
                private scheduler?: Scheduler) {
        super();
    }

    protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
        return null;
    }
}