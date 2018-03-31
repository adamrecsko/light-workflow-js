import 'reflect-metadata';
import { BaseWorkflowClient } from './workflow-client';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Notification } from 'rxjs/Rx';
import { ActivityPollParameters } from './aws.types';
import { AWSClientProvider } from './aws-client-provider';
import { TestLogger } from '../testing/mocks/test-logger';
import * as SWF from 'aws-sdk/clients/swf';

class MockAdapter implements AWSClientProvider {
  getNativeSWFClient(): SWF {
    return undefined;
  }

}

describe('BaseWorkflowClient', () => {

  const basewf = new BaseWorkflowClient(new MockAdapter(), new TestLogger());

  describe('fromSwfFunction', () => {
    it('should call the given function with the given parameter on subscribe', () => {
      const testFunction = sinon.spy();
      const param = new ActivityPollParameters(
        'domain',
        { name: 'tasklist' },
      );
      const obs = basewf.fromSwfFunction(testFunction, param);
      obs.subscribe();
      sinon.assert.calledWith(testFunction, param);
    });

    it('should emit async function result and complete', () => {
      type P = { param: string };
      type D = { data: string };
      const param = new ActivityPollParameters(
        'domain',
        { name: 'tasklist' },
      );
      const result: D = { data: 'r' };
      const testFunction = (p: P, cb: (error: any, data: D) => {}) => {
        cb(null, result);
      };
      const obs = basewf.fromSwfFunction<D>(testFunction as any, param);
      const testObs = obs.materialize();
      let values: Notification<any>[] = [];
      testObs.toArray().subscribe((v: any) => values = v);
      expect(values).to.eql([
        Notification.createNext(result),
        Notification.createComplete(),
      ]);
    });
    it('should emit error if the async function returns back error', () => {
      type P = { param: string };
      type D = { data: string };
      const param = new ActivityPollParameters(
        'domain',
        { name: 'tasklist' });
      const error = { error: 'error' };
      const testFunction = (p: P, cb: (error: any, data: D) => {}) => {
        cb(error, null);
      };
      const obs = basewf.fromSwfFunction<D>(testFunction as any, param);
      const testObs = obs.materialize();
      let values: Notification<any>[] = [];
      testObs.toArray().subscribe((v: any) => values = v);
      expect(values).to.eql([
        Notification.createError(error),
      ]);
    });
  });

});
