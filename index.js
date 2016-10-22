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
let TestActivityImpl = class TestActivityImpl {
    constructor() {
        console.log("ACTIVITY! CONSTRUCOT");
    }
    helloWorld(message) {
        console.log(message);
    }
    method1(message, alma, v) {
        console.log(message);
        return null;
    }
};
__decorate([
    dec('cicapannu'), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String]), 
    __metadata('design:returntype', void 0)
], TestActivityImpl.prototype, "helloWorld", null);
__decorate([
    dec('nyuzette'), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String, Boolean, TestActivityImpl]), 
    __metadata('design:returntype', TestActivityImpl)
], TestActivityImpl.prototype, "method1", null);
TestActivityImpl = __decorate([
    inversify_2.injectable(), 
    __metadata('design:paramtypes', [])
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
kernel.bind(TestActivityImpl).to(TestActivityImpl);
kernel.get(TestActivityImpl).helloWorld('szia');
kernel.get(TestActivityImpl).helloWorld('szia');
class ActivityContainer {
    constructor(app) {
    }
}
class Application {
    constructor(configuration) {
    }
    register(implementations) {
    }
    loadKernelModule(kernelModule) {
    }
}
const application = new Application({
    secret: 'gaggas=='
});
//# sourceMappingURL=index.js.map