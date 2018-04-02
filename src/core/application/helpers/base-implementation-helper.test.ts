import 'reflect-metadata';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ActorProxyFactory } from '../../actor/proxy/actor-proxy-factory';
import { Newable } from '../../../implementation';
import { Container, inject, injectable } from 'inversify';
import { DEFAULT_ACTOR_TASK_LIST } from '../../../constants';
import { taskList, actorClient } from '../../actor/decorators/actor-decorators';
import { Binding } from '../../generics/implementation-helper';
import { WorkflowClientFactory } from '../../workflow/workflow-client-factory';
import { workflowClient } from '../../workflow/decorators/workflow-client-decorators';
import { RemoteWorkflowStub } from '../../workflow/workflow-proxy';
import { BaseImplementationHelper } from './base-implementation-helper';

const testActorSymbol = Symbol('testActorSymbol');
const testDeciderSymbol = Symbol('testDeciderSymbol');

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

const testWorkflowSymbol = Symbol('test wf symbol');

interface TestWorkflow {
  workflow(): string;
}

@injectable()
class TestWorkflowImpl implements TestWorkflow {
  workflow(): string {
    return null;
  }
}


class MockWorkflowClientFactory implements WorkflowClientFactory {
  create<T>(implementation: Newable<T>): RemoteWorkflowStub<T> {
    return null;
  }
}

describe('BaseImplementationHelper', () => {
  let container: Container;
  let mockActorFactory: ActorProxyFactory;
  let mockWorkflowClientFactory: WorkflowClientFactory;
  beforeEach(() => {
    container = new Container();
    mockActorFactory = new MockRemoteActorProxyFactory();
    mockWorkflowClientFactory = new MockWorkflowClientFactory();
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
      const helper = new BaseImplementationHelper(container, mockActorFactory, mockWorkflowClientFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
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
      const helper = new BaseImplementationHelper(container, mockActorFactory, mockWorkflowClientFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
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
      const helper = new BaseImplementationHelper(container, mockActorFactory, mockWorkflowClientFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
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
      const helper = new BaseImplementationHelper(container, mockActorFactory, mockWorkflowClientFactory);
      const binding: Binding = {
        impl: TestActorImpl,
        key: testActorSymbol,
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


  it('should inject workflow client', () => {
    @injectable()
    class TestApplication {
      constructor(@inject(testWorkflowSymbol)
                  @workflowClient
                  public workflow: TestWorkflow) {
      }
    }

    const mockWorkflow = { data: 'test' };
    const createStub = sinon.stub().returns(mockWorkflow);
    const helper = new BaseImplementationHelper(container, mockActorFactory, mockWorkflowClientFactory);
    const binding: Binding = {
      impl: TestWorkflowImpl,
      key: testWorkflowSymbol,
    };

    mockWorkflowClientFactory.create = createStub;
    helper.addImplementations(
      [binding],
    );
    container.bind<TestApplication>(TestApplication).toSelf();
    const testInstance: TestApplication = container.get<TestApplication>(TestApplication);
    expect(testInstance.workflow).to.be.eq(mockWorkflow);
  });

});



