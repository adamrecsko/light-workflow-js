import {Observable} from "rxjs";
import {injectable} from "inversify";
import {description, version, activity} from "../../../core/activity/decorators/activity-decorators";
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

    @activity
    formatText(text: string): Observable<string> {
        return Observable.of(text + ' hello world');
    }

    @activity
    @version('23-b')
    @description('print the text out')
    printIt(text: string): Observable<any> {
        return Observable.of(text).do((text: string) => {
            this.printer(text);
        });
    }
}