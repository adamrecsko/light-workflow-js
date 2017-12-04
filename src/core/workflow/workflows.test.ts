import {WorkflowClient} from "../../aws/workflow-client";
import {MockWorkflowClient} from "../../testing/mocks/workflow-client";
import {BaseWorkflows, Workflows} from "./workflows";
import {WorkflowDefinition} from "./workflow-definition";

import {stub, assert} from 'sinon';
import {Observable} from "rxjs/Observable";
import {WorkflowStartParameters} from "../../aws/aws.types";
import {UuidGenerator} from "../utils/uuid-generator";


describe('Workflows', () => {
  let workflowClient: WorkflowClient;
  let workflows: Workflows;
  let uuidGenerator: UuidGenerator;

  beforeEach(() => {
    workflowClient = new MockWorkflowClient();
    uuidGenerator = {} as UuidGenerator;
    workflows = new BaseWorkflows(workflowClient, uuidGenerator);
  });

  it('should start a workflow with the proper parameters', async () => {
    const testMethodName = 'testMethodName';
    const testParam1 = 'testParam1';
    const testParam2 = 10000;
    const testParam3 = [10, '10', true];
    const workflowDefinition: WorkflowDefinition = new WorkflowDefinition(testMethodName);
    workflowDefinition.domain = 'expectedDomain';
    workflowDefinition.name = 'expectedName';
    workflowDefinition.version = 'expectedVersion';
    workflowDefinition.taskList = {
      name: 'expectedTaskListName'
    };
    workflowDefinition.taskPriority = 'expectedPriority';
    workflowDefinition.executionStartToCloseTimeout = 'expectedExecutionStartToCloseTimeout';
    workflowDefinition.tagList = ['tag1', 'tag2'];
    workflowDefinition.taskStartToCloseTimeout = 'expectedTaskStartToCloseTimeout';
    workflowDefinition.childPolicy = 'expectedChildPolicy';
    workflowDefinition.lambdaRole = 'expectedLambdaRole';

    const workflowStartStub = stub().returns(Observable.of({}));
    const uuidGenerateStub = stub().returns('generatedWorkflowId');
    workflowClient.startWorkflow = workflowStartStub;
    uuidGenerator.generate = uuidGenerateStub;
    const start = workflows.createStarter('expectedDomain', 'expectedTaskList');
    await start(workflowDefinition as any, testParam1, testParam2, testParam3);
    const expectedInput = JSON.stringify([testParam1, testParam2, testParam3]);
    const expectedParameters: WorkflowStartParameters = {
      domain: 'expectedDomain',
      workflowId: 'generatedWorkflowId',
      workflowType: {
        name: workflowDefinition.name,
        version: workflowDefinition.version
      },
      taskList: {
        name: 'expectedTaskList'
      },
      taskPriority: workflowDefinition.taskPriority,
      input: expectedInput,
      executionStartToCloseTimeout: workflowDefinition.executionStartToCloseTimeout,
      tagList: workflowDefinition.tagList,
      taskStartToCloseTimeout: workflowDefinition.taskStartToCloseTimeout,
      childPolicy: workflowDefinition.childPolicy,
      lambdaRole: workflowDefinition.lambdaRole,
    };
    assert.calledWith(workflowStartStub, expectedParameters);
  });
});