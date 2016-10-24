import "reflect-metadata";
import {KernelModule, Kernel} from 'inversify';
import {injectable,inject} from "inversify";
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
class Tes1 {
    constructor() {
        console.log("ACTIVITY! Tes1");
    }
}

@injectable()
class TestActivityImpl implements TestActivity {

    helloWorld(message: string): void {
        console.log(message);
    }

    constructor(@inject('Tes1') test: Tes1) {
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

kernel.bind<Tes1>('Tes1').to(Tes1);

kernel.bind<TestActivity>(TestActivityImpl).to(TestActivityImpl);
kernel.get<TestActivity>(TestActivityImpl).helloWorld('szia');

kernel.get<TestActivity>(TestActivityImpl).helloWorld('szia');
