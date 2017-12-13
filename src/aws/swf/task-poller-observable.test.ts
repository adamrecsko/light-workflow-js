import { TaskPollerObservable } from './task-poller-observable';
import { Observable } from 'rxjs/Observable';
import { ActivityTask } from '../aws.types';
import { TestScheduler } from 'rxjs/Rx';
import { expect } from 'chai';
import { TestMessage } from 'rxjs/testing/TestMessage';

describe('ActivityTaskPollerObservable', () => {

  context('when no error happens', () => {
    it('should repeat subscribe to the given observable', () => {
      const testData: ActivityTask = {
        activityId: '12',
        taskToken: 'token',
        startedEventId: 1,
        activityType: {
          name: 'activity',
          version: '123',
        },
        workflowExecution: {
          workflowId: '1',
          runId: '2',
        },
      };
      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });

      const testObservable: Observable<ActivityTask> = Observable.from([testData], testScheduler);
      const poller = new TaskPollerObservable(testObservable, testScheduler, 10);
      testScheduler.expectObservable(poller.take(3)).toBe('aa(a|)', { a: testData });
      testScheduler.flush();
    });
  });


  context('when error happens', () => {
    it('should emit error and stop', () => {
      const error = new Error('error');
      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const testObservable: Observable<ActivityTask> =
                Observable.throw(error, testScheduler);

      const poller = new TaskPollerObservable(testObservable, testScheduler, 10);
      testScheduler.expectObservable(poller.take(3)).toBe('#', null, error);
      testScheduler.flush();
    });
  });

});
