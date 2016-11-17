import {Observable} from "rxjs";
export interface ObservableFactory<T> {
    create(...params: any[]): Observable<T>;
}