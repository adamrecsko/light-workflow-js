"use strict";
const Rx_1 = require("rxjs/Rx");
function fromSwfFunction(fnc, params) {
    return Rx_1.Observable.create((obs) => {
        function handler(error, data) {
            if (error) {
                obs.error(error);
                obs.complete();
            }
            else {
                obs.next(data);
                obs.complete();
            }
        }
        try {
            fnc(params, handler);
        }
        catch (e) {
            obs.error(e);
        }
    });
}
exports.fromSwfFunction = fromSwfFunction;
class SwfRx {
    constructor(swfClient) {
        this.swfClient = swfClient;
    }
    pollForActivityTask(params) {
        return fromSwfFunction(this.swfClient.pollForActivityTask, params);
    }
    pollForDecisionTask(params) {
        return fromSwfFunction(this.swfClient.pollForDecisionTask, params);
    }
}
exports.SwfRx = SwfRx;
//# sourceMappingURL=swf-rx.js.map