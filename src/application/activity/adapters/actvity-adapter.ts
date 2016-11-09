import {Observable} from "rxjs";
export interface ActivityAdapter<P,T> {
    getObservable(callParams: P): Observable<T>;
}