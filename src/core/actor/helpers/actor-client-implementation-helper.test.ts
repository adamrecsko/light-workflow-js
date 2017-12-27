import 'reflect-metadata';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  BaseActorClientImplementationHelper,
} from './actor-client-implementation-helper';
import { ActorProxyFactory } from '../proxy/actor-proxy-factory';
import { Newable } from '../../../implementation';
import { Container, inject, injectable } from 'inversify';
import { DEFAULT_ACTOR_TASK_LIST } from '../../../constants';
import { taskList, actorClient } from '../decorators/actor-decorators';
import { Binding } from '../../generics/implementation-helper';


const testActorSymbol = Symbol('testActorSymbol');
const testDeciderSymbol = Symbol('testDeciderSymbol');
const testTaskLists = ['test-task-list', 'test-task-list2'];

class MockRemoteActorProxyFactory implements ActorProxyFactory {
  create<T>(implementation: Newable<T>, taskList: string): T {
    return null;
  }
}

interface TestActor {
  method(): any;
}

@injectable()
class TestActorImpl implements TestActor {
  method() {
  }
}

const mockActor = {
  d: 'mock actor',
};

describe('BaseActorClientImplementationHelper', () => {
  let container: Container;
  let mockActorFactory: ActorProxyFactory;
  beforeEach(() => {
    container = new Container();
    mockActorFactory = new MockRemoteActorProxyFactory();
  });
  context('if not tagged with actorClient', () => {
    it('should inject actor instance', () => {
      @injectable()
      class TestDecider {
        @inject(testActorSymbol)
        public actor: TestActor;

        constructor() {
        }
      }

      container.bind<TestDecider>(TestDecider).toSelf();
      const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
        taskLists: [],
      };
      helper.addImplementations(
        [binding],
      );
      const testInstance: TestDecider = container.get<TestDecider>(TestDecider);
      expect(testInstance.actor).to.instanceOf(TestActorImpl);
    });
  });
  context('if tagged with actorClient', () => {
    it('should inject actor client', () => {
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

      const createStub = sinon.stub().returns(mockActor);
      const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
        taskLists: testTaskLists,
      };

      mockActorFactory.create = createStub;
      helper.addImplementations(
        [binding],
      );
      container.bind<TestDecider>(TestDecider).toSelf();
      const testInstance: TestDecider = container.get<TestDecider>(TestDecider);
      expect(testInstance.actor).to.be.eq(mockActor);
      expect(testInstance.actor2).to.be.eq(mockActor);
    });
    it('should inject actor client with taskList if tagged with taskList', () => {
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

      const createStub = sinon.stub().returns(mockActor);
      const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
        taskLists: testTaskLists,
      };

      mockActorFactory.create = createStub;
      helper.addImplementations(
        [binding],
      );

      container.bind<TestDecider>(TestDecider).toSelf();
      const testInstance: TestDecider = container.get<TestDecider>(TestDecider);
      expect(createStub.getCall(0).args).to.be.eql([TestActorImpl, DEFAULT_ACTOR_TASK_LIST]);
      expect(createStub.getCall(1).args).to.be.eql([TestActorImpl, 'test-task-list']);
      expect(createStub.getCall(2).args).to.be.eql([TestActorImpl, 'test-task-list2']);

    });
    it('should inject actor client to property', () => {
      @injectable()
      class TestDecider {
        @actorClient
        @inject(testActorSymbol)
        public actor: TestActor;
        @actorClient
        @taskList('test-task-list')
        @inject(testActorSymbol)
        public actor2: TestActor;
        @actorClient
        @taskList('test-task-list2')
        @inject(testActorSymbol)
        public actor3: TestActor;

        constructor() {
        }
      }

      const createStub = sinon.stub().returns(mockActor);
      const helper = new BaseActorClientImplementationHelper(container, mockActorFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
        taskLists: testTaskLists,
      };

      mockActorFactory.create = createStub;
      helper.addImplementations(
        [binding],
      );

      container.bind<TestDecider>(TestDecider).toSelf();
      const testInstance: TestDecider = container.get<TestDecider>(TestDecider);
      expect(createStub.getCall(0).args).to.be.eql([TestActorImpl, DEFAULT_ACTOR_TASK_LIST]);
      expect(createStub.getCall(1).args).to.be.eql([TestActorImpl, 'test-task-list']);
      expect(createStub.getCall(2).args).to.be.eql([TestActorImpl, 'test-task-list2']);
    });
  });
});
