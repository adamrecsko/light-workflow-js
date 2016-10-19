import {TeardownLogic} from "rxjs/Subscription";
import {Scheduler} from "rxjs/Scheduler";
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";


export class TaskPollerObservable<T> extends Observable<T> {
    constructor(private activityPollRequest: Observable<T>,
                private scheduler?: Scheduler,
                private timerInterval?: number) {
        super();
        this.timerInterval = this.timerInterval || 100;
    }

    protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
        return Observable.timer(0, this.timerInterval, this.scheduler)
            .exhaustMap(()=>this.activityPollRequest)
            .subscribe(subscriber);
    }

    public get innerObservable() {
        return this.activityPollRequest;
    }
}

