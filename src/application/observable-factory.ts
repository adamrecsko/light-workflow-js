import {Observable} from "rxjs/Observable";
export interface ObservableFactory<T> {
    create(...params: any[]): Observable<T>;
}