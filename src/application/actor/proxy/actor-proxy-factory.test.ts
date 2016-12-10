import "reflect-metadata";
import {RemoteActorProxyFactory} from "./actor-proxy-factory";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {
    RemoteActivityAdapterFactory, DefaultRemoteActivityAdapter,
    RemoteActivityAdapter
} from "../../activity/adapters/remote-activity-adapter";
import {ActivityDefinition} from "../../activity/activity-definition";
import {ObservableFactory} from "../../observable-factory";
import {version, scheduleToCloseTimeout, serializer} from "../../activity/decorators/activity-decorators";
import {MockSerializer} from "../../../testing/mocks/serializer";
import {expect} from "chai";
import {Observable} from "rxjs";
import * as sinon from "sinon";
import {getDefinitionsFromClass} from "../../decorators/utils";

class MockRemoteActivityAdapterFactory implements RemoteActivityAdapterFactory {
    create(contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
           activityDefinition: ActivityDefinition,
           taskList: string,
           observableFactory?: ObservableFactory<string>): DefaultRemoteActivityAdapter {
        return null;
    }
}

class MockContextResolutionStrategy implements ContextResolutionStrategy<DecisionRunContext> {
    getContext(): DecisionRunContext {
        return null;
    }
}

class MockRemoteActivityAdapter implements RemoteActivityAdapter {
    public createObservable(callParams: any[]): Observable<string> {
        return null;
    }
}
const testTaskList = 'test-task-list';


interface Test {
    test1(val: any): Observable<any>;
    test2(): Observable<any>;
}


class TestImpl implements Test {
    @version('1-b')
    @scheduleToCloseTimeout('12345')
    @serializer(new MockSerializer())
    public test1(val: any): Observable<any> {
        return null;
    }

    @version('2')
    @scheduleToCloseTimeout('3210')
    public test2(): Observable<any> {
        return null;
    }
}

describe('RemoteActorProxyFactory', ()=> {
    let contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>;
    let remoteActivityAdapterFactory: RemoteActivityAdapterFactory;
    beforeEach(()=> {
        contextResolutionStrategy = new MockContextResolutionStrategy();
        remoteActivityAdapterFactory = new MockRemoteActivityAdapterFactory();
    });

    it('should create a proxy from the Implementation', ()=> {
        remoteActivityAdapterFactory.create = sinon.stub().returns(new MockRemoteActivityAdapter());
        const remoteActorProxyFactory = new RemoteActorProxyFactory(contextResolutionStrategy, remoteActivityAdapterFactory);
        const actor = remoteActorProxyFactory.create<Test>(TestImpl, testTaskList);
        expect(actor.test1).to.be.a('function');
        expect(actor.test2).to.be.a('function');
    });

    it('should call adapter', ()=> {
        const adapter = new MockRemoteActivityAdapter();
        const testResult = {
            d: 'test'
        };
        const createObservableStub = sinon.stub().returns(testResult);
        adapter.createObservable = createObservableStub;
        remoteActivityAdapterFactory.create = sinon.stub().returns(adapter);
        const remoteActorProxyFactory = new RemoteActorProxyFactory(contextResolutionStrategy, remoteActivityAdapterFactory);
        const actor = remoteActorProxyFactory.create<Test>(TestImpl, testTaskList);
        const test = actor.test1('hello');
        expect(test).to.be.eq(testResult);
        expect(createObservableStub.getCall(0).args).to.be.eql([['hello']]);

    });

    it('should create adapter with proper data', ()=> {
        const adapter = new MockRemoteActivityAdapter();
        const createStub = sinon.stub().returns(adapter);
        remoteActivityAdapterFactory.create = createStub;
        const remoteActorProxyFactory = new RemoteActorProxyFactory(contextResolutionStrategy, remoteActivityAdapterFactory);
        remoteActorProxyFactory.create<Test>(TestImpl, testTaskList);
        const definitions: ActivityDefinition[] = getDefinitionsFromClass<ActivityDefinition>(TestImpl);
        expect(createStub.getCall(0).args).to.be.eql([
            contextResolutionStrategy,
            definitions[0],
            testTaskList
        ]);
        expect(createStub.getCall(1).args).to.be.eql([
            contextResolutionStrategy,
            definitions[1],
            testTaskList
        ]);
    });
});