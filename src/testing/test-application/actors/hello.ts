import {Observable} from "rxjs";
import {injectable} from "inversify";
import {description, version} from "../../../core/activity/decorators/activity-decorators";
export const helloSymbol = Symbol('hello');

export interface Hello {
    formatText(text: string): Observable<string>;
    printIt(text: string): Observable<any>;
}

@injectable()
export class HelloImpl implements Hello {

    private printer(text: string) {
        console.log(text);
    }

    @version('1')
    @description('this thing is a text formatter')
    formatText(text: string): Observable<string> {
        return Observable.of(text + ' hello world');
    }

    @version('1')
    printIt(text: string): Observable<any> {
        return Observable.of(text).do((text: string)=> {
            this.printer(text);
        });
    }
}