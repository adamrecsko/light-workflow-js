import { WorkflowClient } from '../../../aws/workflow-client';
import { MockWorkflowClient } from '../../../testing/mocks/workflow-client';
import { BaseWorkflowWorker, WorkflowWorker } from './workflow-worker';
import { stub, assert } from 'sinon';
import { expect } from 'chai';
import { DecisionTask, RegisterWorkflowTypeInput } from '../../../aws/aws.types';
import {
  defaultChildPolicy, defaultExecutionStartToCloseTimeout, defaultLambdaRole, defaultTaskList, defaultTaskPriority,
  defaultTaskStartToCloseTimeout, description,
  version,
  workflow,
} from '../decorators/workflow-decorators';
import { Observable } from 'rxjs/Observable';
import { AWSError } from 'aws-sdk';
import { Container } from 'inversify';
import { TaskPollerObservable } from '../../../aws/swf/task-poller-observable';
import { BaseContextCache, ContextCache } from '../../context/context-cache';


const TEST_WF = Symbol('TEST_WF');
const domain = 'expectedDomain';
const taskList = 'expectedTaskList';

class TestWfImpl {
  @workflow()
  @version('12')
  @defaultChildPolicy('TERMINATE')
  @defaultExecutionStartToCloseTimeout('10')
  @defaultLambdaRole('arn:...')
  @defaultTaskList({ name: 'default-task-list' })
  @defaultTaskPriority('task-priority')
  @defaultTaskStartToCloseTimeout('20')
  @description('this is a workflow')
  async workflowName() {
    return 4;
  }
}


describe('BaseWorkflowWorker', () => {


  describe('register', () => {

    let workflowClient: WorkflowClient;
    let container: Container;
    const poller: TaskPollerObservable<DecisionTask> = null;
    let contextCache: ContextCache = null;

    beforeEach(() => {
      workflowClient = new MockWorkflowClient();
      container = new Container();
      contextCache = new BaseContextCache();
    });

    it('should register amazon workflow and complete if success', async () => {
      const workflowWorker: WorkflowWorker<TestWfImpl> =
        new BaseWorkflowWorker<TestWfImpl>(workflowClient, container, contextCache, poller, domain, {
          impl: TestWfImpl,
          key: TEST_WF,
          taskLists: [taskList],
        });

      const registerStub = stub().returns(Observable.of(''));
      workflowClient.registerWorkflowType = registerStub;
      await workflowWorker.register().toPromise();
      const expectedRegisterParams: RegisterWorkflowTypeInput = {
        domain,
        name: 'workflowName',
        version: '12',
        defaultChildPolicy: 'TERMINATE',
        defaultExecutionStartToCloseTimeout: '10',
        defaultLambdaRole: 'arn:...',
        defaultTaskList: {
          name: 'default-task-list',
        },
        defaultTaskPriority: 'task-priority',
        defaultTaskStartToCloseTimeout: '20',
        description: 'this is a workflow',
      };
      assert.calledWith(registerStub, expectedRegisterParams);
    });

    it('should success if workflow already registered', async () => {
      const workflowWorker: WorkflowWorker<TestWfImpl> =
        new BaseWorkflowWorker<TestWfImpl>(workflowClient, container, contextCache, poller, domain, {
          impl: TestWfImpl,
          key: TEST_WF,
          taskLists: [taskList],
        });

      const error: Partial<AWSError> = {
        code: 'TypeAlreadyExistsFault',
      };

      const registerStub = stub().returns(Observable.throw(error));
      workflowClient.registerWorkflowType = registerStub;
      await workflowWorker.register().toPromise();
    });

    it('should throw error in case of any error except TypeAlreadyExistsFault', async () => {
      const workflowWorker: WorkflowWorker<TestWfImpl> =
        new BaseWorkflowWorker<TestWfImpl>(workflowClient, container, contextCache, poller, domain, {
          impl: TestWfImpl,
          key: TEST_WF,
          taskLists: [taskList],
        });

      const error: Partial<AWSError> = {
        code: 'Other error',
      };

      workflowClient.registerWorkflowType = stub().returns(Observable.throw(error));

      try {
        await workflowWorker.register().toPromise();
        throw new Error('should throw error');
      } catch (e) {
        expect(e).to.equals(error);
      }
    });

  });


  describe('startWorker', () => {

    it('should ', () => {

      throw Error('error');

    });

  });
});
