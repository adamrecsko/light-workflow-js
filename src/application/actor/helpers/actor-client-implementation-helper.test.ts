import "reflect-metadata";
import {Kernel} from "inversify";
import {expect} from "chai";
import {injectable} from "inversify";
import * as sinon from "sinon";
import {
    BaseActorClientImplementationHelper, ActorImplementation,
    ACTOR_TAG, ACTOR_CLIENT_TAG
} from "./actor-client-implementation-helper";
import {ActorProxyFactory} from "../proxy/actor-proxy-factory";
import {Class} from "../../../implementation";

class MockRemoteActorProxyFactory implements ActorProxyFactory {
    create<T>(implementation: Class<T>, taskList: string): T {
        return null;
    }
}

describe('BaseActorClientImplementationHelper', ()=> {
    it('should load actor\'s implementation to kernel', ()=> {
        @injectable()
        class TestImpl {
            method() {
            }
        }
        const testImplSymbol = Symbol('TestImpl');
        const kernel = new Kernel();
        const mockActorFactory = new MockRemoteActorProxyFactory();
        const helper = new BaseActorClientImplementationHelper(kernel, mockActorFactory);

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
        const mockActorFactory = new MockRemoteActorProxyFactory();

        const mockActor = {
            d: 'mock actor'
        };
        const createStub = sinon.stub().returns(mockActor);
        const helper = new BaseActorClientImplementationHelper(kernel, mockActorFactory);

        mockActorFactory.create = createStub;

        const binding: ActorImplementation = {
            impl: TestImpl,
            binding: testImplSymbol
        };

        helper.addImplementations(
            [binding]
        );
        const testInstance = kernel.getTagged<TestImpl>(testImplSymbol, ACTOR_CLIENT_TAG, true);
        expect(testInstance).to.be.eq(mockActor);
    });
});