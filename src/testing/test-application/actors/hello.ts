import {Observable} from "rxjs";
import {injectable} from "inversify";
import {description, version} from "../../../application/activity/decorators/activity-decorators";
export const helloSymbol = Symbol('hello');

export interface Hello {
    formatText(text: string): Observable<string>;
    printIt(text: string): Observable<any>;
}

@injectable()
export class HelloImpl implements Hello {
    @version('1')
    @description('this thing is a text formatter')
    formatText(text: string): Observable<string> {
        return Observable.of(text + ' hello world');
    }

    @version('1')
    printIt(text: string): Observable<any> {
        return Observable.of(text).do(console.log);
    }
}