import { Observable } from 'rxjs';
import { injectable } from 'inversify';
import { description, version, activity } from '../../../core/actor/activity/decorators/activity-decorators';

export const TEST_ACTOR = Symbol('TEST_ACTOR');

export interface TestActor {
  formatText(text: string): Observable<string>;

  printIt(text: string): Observable<string>;
}

@injectable()
export class TestActorImpl implements TestActor {

  private printer(text: string) {
    console.log(text);
  }

  @activity
  @version('23-b')
  formatText(text: string): Observable<string> {
    return Observable.of(text + ' hello world');
  }

  @activity
  @version('23-b')
  @description('print the text out')
  printIt(text: string): Observable<string> {
    return Observable.of(text).do((text: string) => {
      this.printer(text);
    });
  }
}
