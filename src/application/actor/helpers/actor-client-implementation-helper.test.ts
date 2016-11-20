import "reflect-metadata";
import {Container} from "inversify";
import {expect} from "chai";
import {injectable} from "inversify";
import * as sinon from "sinon";
import {
    BaseActorClientImplementationHelper, Binding,
    actorClient, taskList
} from "./actor-client-implementation-helper";
import {ActorProxyFactory} from "../proxy/actor-proxy-factory";
import {Class} from "../../../implementation";
import {inject} from "inversify";
import {DEFAULT_ACTOR_TASK_LIST} from "../../../constants";

class MockRemoteActorProxyFactory implements ActorProxyFactory {
    create<T>(implementation: Class<T>, taskList: string): T {
        return null;
    }
}

const testActorSymbol = Symbol('testActorSymbol');
const testDeciderSymbol = Symbol('testDeciderSymbol');
const testTaskLists = ['test-task-list', 'test-task-list2'];

interface TestActor {
    method(): any;
}

@injectable()
class TestActorImpl implements TestActor {
    method() {
    }
}

describe('BaseActorClientImplementationHelper', ()=> {

    let container: Container;
    let mockActorFactory: ActorProxyFactory;

    beforeEach(()=> {
        container = new Container();
        mockActorFactory = new MockRemoteActorProxyFactory();
    });

    it('should load actor\'s implementation to Container', ()=> {
        const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
        const binding: Binding = {
            impl: TestActorImpl,
            key: testActorSymbol,
            taskLists: []
        };
        helper.addImplementations(
            [binding]
        );
        const testInstance = container.get<TestActor>(testActorSymbol);
        expect(testInstance).to.instanceOf(TestActorImpl);
    });


    it('should load actor\'s client to kernel', ()=> {
        @injectable()
        class TestDecider {
            constructor(@actorClient
                        @inject(testActorSymbol)
                        public actor: TestActor,
                        @actorClient
                        @taskList('test-task-list2')
                        @inject(testActorSymbol)
                        public actor2: TestActor) {
            }
        }
        const mockActor = {
            d: 'mock actor'
        };
        const createStub = sinon.stub().returns(mockActor);
        const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
        const binding: Binding = {
            impl: TestActorImpl,
            key: testActorSymbol,
            taskLists: testTaskLists
        };

        mockActorFactory.create = createStub;
        helper.addImplementations(
            [binding]
        );

        container.bind<TestDecider>(testDeciderSymbol).to(TestDecider);
        const testInstance: TestDecider = container.get<TestDecider>(testDeciderSymbol);
        expect(testInstance.actor).to.be.eq(mockActor);
        expect(testInstance.actor2).to.be.eq(mockActor);
    });

    it('should create client to taskList', ()=> {
        @injectable()
        class TestDecider {
            constructor(@actorClient
                        @inject(testActorSymbol)
                        public actor: TestActor,
                        @actorClient
                        @taskList('test-task-list')
                        @inject(testActorSymbol)
                        public actor2: TestActor,
                        @actorClient
                        @taskList('test-task-list2')
                        @inject(testActorSymbol)
                        public actor3: TestActor) {
            }
        }
        const mockActor = {
            d: 'mock actor'
        };
        const createStub = sinon.stub().returns(mockActor);
        const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
        const binding: Binding = {
            impl: TestActorImpl,
            key: testActorSymbol,
            taskLists: testTaskLists
        };

        mockActorFactory.create = createStub;
        helper.addImplementations(
            [binding]
        );

        container.bind<TestDecider>(testDeciderSymbol).to(TestDecider);
        const testInstance: TestDecider = container.get<TestDecider>(testDeciderSymbol);
        expect(createStub.getCall(0).args).to.be.eql([TestActorImpl, DEFAULT_ACTOR_TASK_LIST]);
        expect(createStub.getCall(1).args).to.be.eql([TestActorImpl, 'test-task-list']);
        expect(createStub.getCall(2).args).to.be.eql([TestActorImpl, 'test-task-list2']);

    });
});