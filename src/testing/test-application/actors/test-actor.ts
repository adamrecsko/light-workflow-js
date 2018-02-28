import { activity, version } from '../../../core/actor/activity/decorators/activity-decorators';
import { injectable } from 'inversify';
import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';


export const TEST_ACTOR = Symbol('TEST_ACTOR');

export interface TestActor {
  testMethod(text: string, num: number): Observable<string>;
}


@injectable()
export class TestActorImpl implements TestActor {
  @activity
  @version('1')
  testMethod(text: string, num: number): Observable<string> {
    return of(`test-result:${text},${num}`);
  }
}
