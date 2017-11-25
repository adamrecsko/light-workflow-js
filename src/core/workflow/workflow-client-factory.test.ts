import {childPolicy, workflow} from "./decorators/workflow-decorators";
import {BaseWorkflowClientFactory} from "./workflow-client-factory";
import {expect} from "chai";
import {WorkflowDefinition} from "./workflow-definition";

describe('BaseWorkflowClientFactory', () => {
  it('should create workflow client', () => {

    class TestWorkflow {
      @workflow
      @childPolicy('TERMINATE')
      testMethod() {

      }

      @workflow
      @childPolicy('TERMINATE')
      testMethod2() {

      }
    }

    const workflowClientFactory = new BaseWorkflowClientFactory();
    const testWorkflow = workflowClientFactory.create(TestWorkflow);
    expect(testWorkflow.testMethod).a.instanceof(WorkflowDefinition);
    expect(testWorkflow.testMethod2).a.instanceof(WorkflowDefinition);
  });
});