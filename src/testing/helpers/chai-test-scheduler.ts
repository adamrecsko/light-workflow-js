import {TestScheduler} from "rxjs";
import {TestMessage} from "rxjs/testing/TestMessage";
import {expect} from "chai";

export class ChaiTestScheduler extends TestScheduler {
    constructor() {
        super((a: TestMessage[], b: TestMessage[])=> {
            expect(a).to.eql(b);
            // exception type check
            for (let i = 0; i < a.length; i++) {
                if (a[i].notification.kind === 'E')
                  expect(a[i].notification.error).to.be.instanceOf(b[i].notification.error.constructor);
            }
        });
    }
}