import "reflect-metadata";
import {DefaultRemoteActivityAdapter} from "./remote-activity-adapter";
import {ActivityDefinition} from "../activity-definition";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {MockDecisionRunContext} from "../../../testing/mocks/decision-run-context";
import {ObservableFactory} from "../../application/observable-factory";
import {TestScheduler} from "rxjs";
import {ChaiTestScheduler} from "../../../testing/helpers/chai-test-scheduler";
import {Serializer} from "../../application/serializer";
import {expect} from "chai";
import * as sinon from "sinon";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {RemoteObservableFactory, RemoteActivityObservable} from "../observable/remote-activity-observable";
import {MockSerializer} from "../../../testing/mocks/serializer";


class MockContextResolutionStrategy implements ContextResolutionStrategy<DecisionRunContext> {
    getContext(): DecisionRunContext {
        return null;
    }
}

class MockObservableFactory implements RemoteObservableFactory {
    create(decisionContext: DecisionRunContext, scheduleParameters: ScheduleActivityTaskDecisionAttributes): RemoteActivityObservable {
        return null;
    }
}


const testActivityName = 'TestActivityName';
const testActivityVersion = 'test-version-123';
const testTaskList = 'test-task-list';

describe('RemoteActivityAdapter', ()=> {

    let testScheduler: TestScheduler;
    let runContext: DecisionRunContext;
    let testValue: string;
    let contextResolution: ContextResolutionStrategy<DecisionRunContext>;
    let mockObservableFactory: RemoteObservableFactory;
    let definition: ActivityDefinition;
    let mockSerializer: Serializer;

    beforeEach(()=> {
        testScheduler = new ChaiTestScheduler();
        runContext = new MockDecisionRunContext();
        contextResolution = new MockContextResolutionStrategy();
        mockObservableFactory = new MockObservableFactory();
        definition = new ActivityDefinition(testActivityName);
        mockSerializer = new MockSerializer();
        testValue = 'test';

        definition.defaultTaskHeartbeatTimeout = '1111';
        definition.defaultTaskPriority = ' def task priority';
        definition.defaultTaskScheduleToCloseTimeout = '2222';
        definition.defaultTaskScheduleToStartTimeout = '3333';
        definition.defaultTaskStartToCloseTimeout = '4444';
        definition.description = 'description';
        definition.heartbeatTimeout = '5555';
        definition.scheduleToCloseTimeout = '6666';
        definition.scheduleToStartTimeout = '7777';
        definition.startToCloseTimeout = '8888';
        definition.taskPriority = 'task priority';
        definition.version = testActivityVersion;
    });

    it('should create activity observable with schedule parameters', ()=> {
        const nextId = '12234';
        const testInput = 'test-input';
        const activityObservable = {};
        const createStub = sinon.stub().returns(activityObservable);
        const stringifyStub = sinon.stub().returns(testInput);
        const getContextStub = sinon.stub().returns(runContext);
        const nextIdStub = sinon.stub().returns(nextId);
        const testCallAttributes = [100, 'hello'];
        const expectedScheduleParameters: ScheduleActivityTaskDecisionAttributes = {
            activityType: {
                name: testActivityName,
                version: testActivityVersion
            },
            activityId: nextId,
            input: testInput,
            scheduleToCloseTimeout: definition.scheduleToCloseTimeout,
            taskList: {
                name: testTaskList
            },
            scheduleToStartTimeout: definition.scheduleToStartTimeout,
            startToCloseTimeout: definition.startToCloseTimeout,
            heartbeatTimeout: definition.heartbeatTimeout
        };
        runContext.getNextId = nextIdStub;
        contextResolution.getContext = getContextStub;
        mockObservableFactory.create = createStub;
        mockSerializer.stringify = stringifyStub;
        definition.serializer = mockSerializer;
        const remoteActivityAdapter = new DefaultRemoteActivityAdapter(contextResolution, definition, testTaskList, mockObservableFactory);
        remoteActivityAdapter.createObservable(testCallAttributes);
        expect(createStub.getCall(0).args).to.be.eql([runContext, expectedScheduleParameters, mockSerializer]);
        expect(stringifyStub.getCall(0).args).to.be.eql([testCallAttributes]);
    });
});