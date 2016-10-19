"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const Rx_1 = require("rxjs/Rx");
const inversify_1 = require("inversify");
const types_1 = require("./types");
let GenericSwfRx_1 = class GenericSwfRx {
    constructor(awsAdapter) {
        this.awsAdapter = awsAdapter;
        this.swfClient = awsAdapter.getNativeSWFClient();
    }
    pollForActivityTask(params) {
        return GenericSwfRx_1.fromSwfFunction(this.swfClient.pollForActivityTask, params);
    }
    pollForDecisionTask(params) {
        return GenericSwfRx_1.fromSwfFunction(this.swfClient.pollForDecisionTask, params);
    }
    static fromSwfFunction(fnc, params) {
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
};
let GenericSwfRx = GenericSwfRx_1;
GenericSwfRx = GenericSwfRx_1 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.AWS_ADAPTER)), 
    __metadata('design:paramtypes', [Object])
], GenericSwfRx);
exports.GenericSwfRx = GenericSwfRx;
//# sourceMappingURL=swf-rx.js.map