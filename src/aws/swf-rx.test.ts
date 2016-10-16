import {fromSwfFunction} from './swf-rx';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {Notification} from "rxjs/Rx";
import {ActivityPollParameters} from "./aws.types";

describe('fromSwfFunction', ()=> {
    it('should call the given function with the given parameter on subscribe', ()=> {
        const testFunction = sinon.spy();
        const param = new ActivityPollParameters();
        const obs = fromSwfFunction(testFunction, param);
        obs.subscribe();
        sinon.assert.calledWith(testFunction, param);

    });

    it('should emit async function result and complete', ()=> {
        type P = {param:string};
        type D = {data:string};
        const param = new ActivityPollParameters();
        const result:D = {data: 'r'};
        const testFunction = (p:P, cb:(error:any, data:D)=>{})=> {
            cb(null, result);
        };
        const obs = fromSwfFunction<D>(testFunction, param);
        const testObs = obs.materialize();
        let values:Notification<any>[];
        testObs.toArray().subscribe((v)=>values = v);
        expect(values).to.eql([
            Notification.createNext(result),
            Notification.createComplete()
        ]);
    });
    it('should emit error if the async function returns back error', ()=> {
        type P = {param:string};
        type D = {data:string};
        const param = new ActivityPollParameters();
        const error = {error: 'error'};
        const testFunction = (p:P, cb:(error:any, data:D)=>{})=> {
            cb(error, null);
        };
        const obs = fromSwfFunction<D>(testFunction, param);
        const testObs = obs.materialize();
        let values:Notification<any>[];
        testObs.toArray().subscribe((v)=>values = v);
        expect(values).to.eql([
            Notification.createError(error)
        ]);
    });
});