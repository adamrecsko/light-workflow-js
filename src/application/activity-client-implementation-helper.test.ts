import "reflect-metadata";
import {
    BaseActivityClientImplementationHelper, ActivityImplementation,
    ActivityClient
} from "./activity-client-implementation-helper";
import {Kernel} from "inversify";
import {expect} from "chai";
import {injectable} from "inversify";
describe('BaseActivityClientImplementationHelper', ()=> {
    it('should load activity\'s implementation to kernel', ()=> {
        @injectable()
        class TestImpl {
            method() {
            }
        }
        const testImplSymbol = Symbol('TestImpl');
        const kernel = new Kernel();
        const helper = new BaseActivityClientImplementationHelper(kernel);

        const binding: ActivityImplementation = {
            impl: TestImpl,
            binding: testImplSymbol
        };
        helper.addImplementations(
            [binding]
        );
        const testInstance = kernel.getTagged<TestImpl>(testImplSymbol, 'activity', true);
        expect(testInstance).to.instanceOf(TestImpl);
    });

    it('should load activity\'s client to kernel', ()=> {
        @injectable()
        class TestImpl {
            method() {
            }
        }
        const testImplSymbol = Symbol('TestImpl');
        const kernel = new Kernel();
        const helper = new BaseActivityClientImplementationHelper(kernel);

        const binding: ActivityImplementation = {
            impl: TestImpl,
            binding: testImplSymbol
        };
        helper.addImplementations(
            [binding]
        );
        const testInstance = kernel.getTagged<ActivityClient<TestImpl>>(testImplSymbol, 'activity-client', true);
        expect(testInstance).to.instanceOf(ActivityClient);
    });
});