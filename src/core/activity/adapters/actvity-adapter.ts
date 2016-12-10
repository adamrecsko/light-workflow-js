import {Observable} from "rxjs";
export interface ActivityAdapter<P,T> {
    createObservable(callParams: P): Observable<T>;
}