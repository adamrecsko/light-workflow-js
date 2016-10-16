"use strict";
const swf_rx_1 = require('./swf-rx');
const chai_1 = require('chai');
const sinon = require('sinon');
const Rx_1 = require("rxjs/Rx");
const aws_types_1 = require("./aws.types");
describe('fromSwfFunction', () => {
    it('should call the given function with the given parameter on subscribe', () => {
        const testFunction = sinon.spy();
        const param = new aws_types_1.ActivityPollParameters();
        const obs = swf_rx_1.fromSwfFunction(testFunction, param);
        obs.subscribe();
        sinon.assert.calledWith(testFunction, param);
    });
    it('should emit async function result and complete', () => {
        const param = new aws_types_1.ActivityPollParameters();
        const result = { data: 'r' };
        const testFunction = (p, cb) => {
            cb(null, result);
        };
        const obs = swf_rx_1.fromSwfFunction(testFunction, param);
        const testObs = obs.materialize();
        let values;
        testObs.toArray().subscribe((v) => values = v);
        chai_1.expect(values).to.eql([
            Rx_1.Notification.createNext(result),
            Rx_1.Notification.createComplete()
        ]);
    });
    it('should emit error if the async function returns back error', () => {
        const param = new aws_types_1.ActivityPollParameters();
        const error = { error: 'error' };
        const testFunction = (p, cb) => {
            cb(error, null);
        };
        const obs = swf_rx_1.fromSwfFunction(testFunction, param);
        const testObs = obs.materialize();
        let values;
        testObs.toArray().subscribe((v) => values = v);
        chai_1.expect(values).to.eql([
            Rx_1.Notification.createError(error)
        ]);
    });
});
//# sourceMappingURL=swf-rx.test.js.map