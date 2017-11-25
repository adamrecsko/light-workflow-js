import {Container, inject, injectable} from "inversify";
import {WorkflowClientFactory} from "./workflow-client-factory";
import {Newable} from "../../implementation";
import {WorkflowProxy} from "./workflow-proxy";
import {Binding} from "../generics/implementation-helper";
import {BaseWorkflowClientImplementationHelper} from "./workflow-client-implementation-helper";
import * as sinon from "sinon";
import {expect} from "chai";
import {workflowClient} from "./decorators/workflow-client-decorators";

const testWorkflowSymbol = Symbol('test wf symbol');

interface TestWorkflow {
  workflow(): string
}

@injectable()
class TestWorkflowImpl implements TestWorkflow {
  workflow(): string {
    return null;
  }
}


class MockWorkflowClientFactory implements WorkflowClientFactory {
  create<T>(implementation: Newable<T>): WorkflowProxy {
    return null;
  }
}


describe('BaseWorkflowClientImplementationHelper', () => {
  let container: Container;
  let mockFactory: WorkflowClientFactory;
  beforeEach(() => {
    container = new Container();
    mockFactory = new MockWorkflowClientFactory();
  });

  it('should inject workflow client', () => {
    @injectable()
    class TestApplication {
      constructor(@inject(testWorkflowSymbol)
                  @workflowClient
                  public workflow: TestWorkflow) {
      }
    }

    const mockWorkflow = {data: 'test'};
    const createStub = sinon.stub().returns(mockWorkflow);
    const helper = new BaseWorkflowClientImplementationHelper(container, mockFactory);
    const binding: Binding = {
      impl: TestWorkflowImpl,
      key: testWorkflowSymbol
    };

    mockFactory.create = createStub;
    helper.addImplementations(
      [binding]
    );
    container.bind<TestApplication>(TestApplication).toSelf();
    const testInstance: TestApplication = container.get<TestApplication>(TestApplication);
    expect(testInstance.workflow).to.be.eq(mockWorkflow);
  });

  it('should inject original implementation', () => {
    @injectable()
    class TestApplication {
      constructor(@inject(testWorkflowSymbol)

                  public workflow: TestWorkflow) {
      }
    }

    const helper = new BaseWorkflowClientImplementationHelper(container, mockFactory);
    const binding: Binding = {
      impl: TestWorkflowImpl,
      key: testWorkflowSymbol
    };
    helper.addImplementations(
      [binding]
    );
    container.bind<TestApplication>(TestApplication).toSelf();
    const testInstance: TestApplication = container.get<TestApplication>(TestApplication);
    expect(testInstance.workflow).a.instanceof(TestWorkflowImpl);
  });

});