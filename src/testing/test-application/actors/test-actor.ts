import { Observable } from 'rxjs';
import { injectable } from 'inversify';
import { description, version, activity, scheduleToCloseTimeout, scheduleToStartTimeout, startToCloseTimeout, heartbeatTimeout } from '../../../core/actor/activity/decorators/activity-decorators';

export const TEST_ACTOR = Symbol('TEST_ACTOR');

export interface TestActor {
  formatText(text: string): Observable<string>;

  printIt(text: string): Observable<string>;
}

@injectable()
export class TestActorImpl implements TestActor {

  private printer(text: string) {
    console.log('ACTIVITY PRINTED TEXT:', text);
  }

  @activity()
  @version('24-b')
  formatText(text: string): Observable<string> {
    return Observable.of(text + ' test');
  }

  @activity()
  @version('24-b')
  @description('print the text out')
  printIt(text: string): Observable<string> {
    return Observable.of(text).do((text: string) => {
      this.printer(text);
    });
  }
}
