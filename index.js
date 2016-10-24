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
require("reflect-metadata");
const inversify_1 = require('inversify');
const inversify_2 = require("inversify");
const kernel = new inversify_1.Kernel();
require("proxy-polyfill");
const WF_DEFINITION = Symbol('WF_DEFINITION');
function dec(value) {
    return function (target, propertyKey, descriptor) {
        console.log(Reflect.getMetadata("design:paramtypes", target, propertyKey));
        target[WF_DEFINITION] = target[WF_DEFINITION] || [];
        target[WF_DEFINITION].push({
            propertyKey,
            value
        });
        target[propertyKey].message = value;
    };
}
const testActivitySymbol = Symbol('testActivty');
let Tes1 = class Tes1 {
    constructor() {
        console.log("ACTIVITY! Tes1");
    }
};
Tes1 = __decorate([
    inversify_2.injectable(), 
    __metadata('design:paramtypes', [])
], Tes1);
let TestActivityImpl = class TestActivityImpl {
    constructor(test) {
        console.log("ACTIVITY! CONSTRUCOT");
    }
    helloWorld(message) {
        console.log(message);
    }
};
TestActivityImpl = __decorate([
    inversify_2.injectable(),
    __param(0, inversify_2.inject('Tes1')), 
    __metadata('design:paramtypes', [Tes1])
], TestActivityImpl);
function getClient(classImp) {
    const proto = classImp.prototype;
    const client = {};
    const activityDefinitions = proto[WF_DEFINITION];
    for (let definition in activityDefinitions) {
        client[activityDefinitions[definition].propertyKey] = function () {
        };
    }
    return client;
}
const registerActivity = (activityClass) => {
};
kernel.bind('Tes1').to(Tes1);
kernel.bind(TestActivityImpl).to(TestActivityImpl);
kernel.get(TestActivityImpl).helloWorld('szia');
kernel.get(TestActivityImpl).helloWorld('szia');
//# sourceMappingURL=index.js.map