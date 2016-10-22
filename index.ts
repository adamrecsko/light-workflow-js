import "reflect-metadata";
import {KernelModule, Kernel} from 'inversify';
import {injectable} from "inversify";
const kernel = new Kernel();

import "proxy-polyfill";

const WF_DEFINITION = Symbol('WF_DEFINITION');

function dec(value: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {


        console.log(Reflect.getMetadata("design:paramtypes", target, propertyKey));

        target[WF_DEFINITION] = target[WF_DEFINITION] || [];

        target[WF_DEFINITION].push({
            propertyKey,
            value
        });

        target[propertyKey].message = value;
    }
}


interface TestActivity {
    helloWorld(message: string): void;

}

const testActivitySymbol = Symbol('testActivty');


@injectable()
class TestActivityImpl implements TestActivity {
    @dec('cicapannu')
    helloWorld(message: string): void {
        console.log(message);
    }

    @dec('nyuzette')
    method1(message: string, alma: boolean, v: TestActivityImpl): TestActivityImpl {
        console.log(message);
        return null;
    }

    constructor() {

        console.log("ACTIVITY! CONSTRUCOT");
    }
}


interface Method {
    message: string
}


function getClient<T>(classImp: any): T {
    const proto = classImp.prototype;
    const client: any = {};
    const activityDefinitions: any = proto[WF_DEFINITION];

    //console.log(activityDefinitions);

    for (let definition in activityDefinitions) {
        client[activityDefinitions[definition].propertyKey] = function () {
            // console.log(activityDefinitions[definition].value);
        };
    }
    return client;
}

//const client = getClient<TestActivity>(TestActivityImpl);

//client.helloWorld('nyalóka');


const registerActivity = (activityClass: any)=> {


};

kernel.bind<TestActivity>(TestActivityImpl).to(TestActivityImpl);
kernel.get<TestActivity>(TestActivityImpl).helloWorld('szia');

kernel.get<TestActivity>(TestActivityImpl).helloWorld('szia');


class ActivityContainer {
    constructor(app: any) {
    }
}

class Application {
    private applicationKernel: Kernel;

    constructor(configuration: any) {
    }

    register(implementations: any[]) {
    }

    loadKernelModule(kernelModule: any) {

    }
}


const application = new Application({
    secret: 'gaggas=='
});








