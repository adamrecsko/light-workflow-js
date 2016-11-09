import "reflect-metadata";
import {Kernel} from "inversify";
import {expect} from "chai";
import {injectable} from "inversify";
import {
    BaseActorClientImplementationHelper, ActorImplementation,
    ACTOR_TAG, ActivityClient, ACTOR_CLIENT_TAG
} from "./actor-client-implementation-helper";
describe('BaseActorClientImplementationHelper', ()=> {
    it('should load actor\'s implementation to kernel', ()=> {
        @injectable()
        class TestImpl {
            method() {
            }
        }
        const testImplSymbol = Symbol('TestImpl');
        const kernel = new Kernel();
        const helper = new BaseActorClientImplementationHelper(kernel);

        const binding: ActorImplementation = {
            impl: TestImpl,
            binding: testImplSymbol
        };
        helper.addImplementations(
            [binding]
        );
        const testInstance = kernel.getTagged<TestImpl>(testImplSymbol, ACTOR_TAG, true);
        expect(testInstance).to.instanceOf(TestImpl);
    });


    it('should load actor\'s client to kernel', ()=> {
        @injectable()
        class TestImpl {
            method() {
            }
        }
        const testImplSymbol = Symbol('TestImpl');
        const kernel = new Kernel();
        const helper = new BaseActorClientImplementationHelper(kernel);

        const binding: ActorImplementation = {
            impl: TestImpl,
            binding: testImplSymbol
        };

        helper.addImplementations(
            [binding]
        );
        const testInstance = kernel.getTagged<ActivityClient<TestImpl>>(testImplSymbol, ACTOR_CLIENT_TAG, true);
        expect(testInstance).to.instanceOf(ActivityClient);
    });
});