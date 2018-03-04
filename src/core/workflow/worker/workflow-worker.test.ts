import { WorkflowClient } from '../../../aws/workflow-client';
import { MockWorkflowClient } from '../../../testing/mocks/workflow-client';
import { BaseWorkflowWorker, WorkflowWorker } from './workflow-worker';
import { expect } from 'chai';
import { DecisionTask, RegisterWorkflowTypeInput, ScheduleActivityTaskDecisionAttributes } from '../../../aws/aws.types';
import {
  defaultChildPolicy, defaultExecutionStartToCloseTimeout, defaultLambdaRole, defaultTaskList, defaultTaskPriority,
  defaultTaskStartToCloseTimeout, description,
  version,
  workflow,
} from '../decorators/workflow-decorators';
import { Observable } from 'rxjs/Observable';
import { AWSError } from 'aws-sdk';
import { Container, injectable } from 'inversify';
import { ContextCache } from '../../context/context-cache';
import { DecisionRunContext } from '../../context/decision-run-context';
import { suite, test } from 'mocha-typescript';
import { Binding } from '../../generics/implementation-helper';
import { TestScheduler } from 'rxjs/Rx';
import { ChaiTestScheduler } from '../../../testing/helpers/chai-test-scheduler';
import { BaseWorkflowDecisionPollGenerator } from '../../../testing/helpers/workflow-decision-poll-generator';
import { HistoryEventProcessor } from '../../context/state-machines/history-event-state-machines/history-event-state-machine';
import { WorkflowExecution } from '../../context/state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution';
import { ActivityDecisionStateMachine } from '../../context/state-machines/history-event-state-machines/activity-decision-state-machine/activity-decision';
import * as sinon from 'sinon';
import { WorkflowHistoryGenerator } from '../../../testing/helpers/workflow-history-generator';
import { WorkflowExecutionStates } from '../../context/state-machines/history-event-state-machines/workflow-execution-state-machines/workflow-execution-states';
import { ContextResolutionStrategy } from '../../context/resolution-strategies/resolution-stategy';
import { ZoneContextResolutionStrategy } from '../../context/resolution-strategies/zone-resolution-strategy';
import { DECISION_RUN_CONTEXT_ZONE_KEY } from '../../../constants';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';


const TEST_WF = Symbol('TEST_WF');
const domain = 'expectedDomain';
const taskList = 'expectedTaskList';

@injectable()
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

const binding: Binding<TestWfImpl> = {
  impl: TestWfImpl,
  key: TEST_WF,
  taskLists: [taskList],
};


class MockDecisionRunContext implements DecisionRunContext {
  processEventList(decisionTask: DecisionTask): void {
  }

  scheduleActivity(attributes: ScheduleActivityTaskDecisionAttributes): ActivityDecisionStateMachine {
    return undefined;
  }

  getStateMachines(): HistoryEventProcessor<any>[] {
    return undefined;
  }

  getNextId(): string {
    return undefined;
  }

  getWorkflowExecution(): WorkflowExecution {
    return undefined;
  }
}

class MockContextCache implements ContextCache {
  getOrCreateContext(runId: string): DecisionRunContext {
    return undefined;
  }
}

class MockWorkflowExecution {

}

@suite
class BaseWorkflowWorkerTest {
  workflowClient: WorkflowClient;
  container: Container;
  poller: any;
  contextCache: ContextCache;
  testScheduler: TestScheduler;
  pollGenerator: BaseWorkflowDecisionPollGenerator;
  decisionContext: DecisionRunContext;
  binding: Binding<any>;
  workflowHistoryGen: WorkflowHistoryGenerator;
  workflowExecution: WorkflowExecution;
  contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>;

  before() {
    this.workflowClient = new MockWorkflowClient();
    this.container = new Container();
    this.contextCache = sinon.createStubInstance(MockContextCache);
    this.decisionContext = sinon.createStubInstance(MockDecisionRunContext);
    (this.contextCache.getOrCreateContext as any).returns(this.decisionContext);
    this.testScheduler = new ChaiTestScheduler();
    this.pollGenerator = new BaseWorkflowDecisionPollGenerator();
    this.binding = binding;
    this.poller = Observable.never();
    this.workflowHistoryGen = new WorkflowHistoryGenerator();
    this.workflowExecution = new MockWorkflowExecution() as any;
    (this.decisionContext.getWorkflowExecution as any).returns(this.workflowExecution);
    this.contextResolutionStrategy = new ZoneContextResolutionStrategy(DECISION_RUN_CONTEXT_ZONE_KEY);
  }

  @test
  async shouldRegisterAmazonWorkflow() {
    const workflowWorker: WorkflowWorker<TestWfImpl> = this.createWorker();
    const registerStub = sinon.stub().returns(Observable.of(''));
    this.workflowClient.registerWorkflowType = registerStub;
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
    sinon.assert.calledWith(registerStub, expectedRegisterParams);
  }

  @test
  async shouldRegisterSuccessIfWorkflowAlreadyRegistered() {
    const workflowWorker: WorkflowWorker<TestWfImpl> = this.createWorker();

    const error: Partial<AWSError> = {
      code: 'TypeAlreadyExistsFault',
    };

    const registerStub = sinon.stub().returns(Observable.throw(error));
    this.workflowClient.registerWorkflowType = registerStub;
    await workflowWorker.register().toPromise();
  }

  @test
  async registerShouldThrowException() {
    const workflowWorker: WorkflowWorker<TestWfImpl> = this.createWorker();
    const error: Partial<AWSError> = {
      code: 'Other error',
    };

    this.workflowClient.registerWorkflowType = sinon.stub().returns(Observable.throw(error));

    try {
      await workflowWorker.register().toPromise();
      throw new Error('should throw error');
    } catch (e) {
      expect(e).to.equals(error);
    }
  }

  @test
  async runWorkflowShouldStartPolling() {
    const task = this.pollGenerator.generateTask();
    const values = {
      a: task,
    };
    this.loadBinding(this.binding);
    this.poller = this.testScheduler.createColdObservable('a|', values);
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    this.testScheduler.flush();
    sinon.assert.alwaysCalledWith(this.contextCache.getOrCreateContext as any, task.workflowExecution.runId);
  }

  @test
  async shouldCreateImplementation() {
    @injectable()
    class TestWf {
      static createSpy = sinon.spy();

      constructor() {
        TestWf.createSpy();
      }

      @workflow()
      test() {

      }
    }

    this.binding.impl = TestWf;
    this.loadBinding(this.binding);
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    sinon.assert.calledOnce(TestWf.createSpy);
  }

  @test
  shouldCallImplementationOfTheCorrespondingWf() {
    @injectable()
    class TestWf {
      static testCall = sinon.spy();

      constructor() {
      }

      @workflow()
      @version('1-test')
      async test_wf(param1: string) {
        TestWf.testCall(param1);
      }
    }

    this.binding.impl = TestWf;
    const workflowType = {
      name: 'test_wf',
      version: '1-test',
    };

    this.workflowExecution.workflowType = workflowType;
    this.workflowExecution.input = JSON.stringify(['test_input']);

    const task = this.pollGenerator.generateTask(
      {
        workflowType,
        events: [this.workflowHistoryGen.createStartedEvent({
          workflowType,
        })],
      },
    );
    const values = {
      a: task,
    };
    this.loadBinding(this.binding);
    this.poller = this.testScheduler.createColdObservable('a|', values);
    this.workflowExecution.currentState = WorkflowExecutionStates.Created;
    this.workflowExecution.onChange = this.testScheduler
      .createColdObservable('--a|', { a: WorkflowExecutionStates.Started });
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    this.testScheduler.flush();
    sinon.assert.calledWith(TestWf.testCall, 'test_input');
  }

  @test
  shouldCallProcessEventList() {
    const task = this.pollGenerator.generateTask();
    const values = {
      a: task,
    };
    this.loadBinding(this.binding);
    this.poller = this.testScheduler.createColdObservable('a|', values);
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    this.testScheduler.flush();
    sinon.assert.calledWith(this.decisionContext.processEventList as any, task);
  }

  @test
  shouldCallProcessEventListInsideZoneContextWithRunContext() {
    let ctx: DecisionRunContext = null;
    const task = this.pollGenerator.generateTask();
    const values = {
      a: task,
    };

    this.decisionContext.processEventList = () => {
      ctx = this.contextResolutionStrategy.getContext();
    };

    this.loadBinding(this.binding);
    this.poller = this.testScheduler.createColdObservable('a|', values);
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    this.testScheduler.flush();

    expect(ctx).to.eq(this.decisionContext);
  }

  @test
  async shouldRespondWorkflowCompleted() {
    @injectable()
    class TestWf {
      constructor() {
      }

      @workflow()
      @version('1-test')
      async test_wf() {
        return 'test-result';
      }
    }

    this.binding.impl = TestWf;
    const workflowType = {
      name: 'test_wf',
      version: '1-test',
    };
    const waiter = new Subject();

    this.workflowExecution.workflowType = workflowType;
    this.workflowExecution.setCompleteStateRequestedWith = sinon.spy() as any;

    sinon.stub(this.workflowClient, 'respondDecisionTaskCompleted').callsFake(() => {
      waiter.complete();
      return of({});
    });


    const task = this.pollGenerator.generateTask(
      {
        workflowType,
        events: [this.workflowHistoryGen.createStartedEvent({
          workflowType,
        })],
      },
    );
    const values = {
      a: task,
    };
    this.loadBinding(this.binding);
    this.poller = this.testScheduler.createColdObservable('a|', values);
    this.workflowExecution.currentState = WorkflowExecutionStates.Created;
    this.workflowExecution.onChange = this.testScheduler
      .createColdObservable('--a|', { a: WorkflowExecutionStates.Started });
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    this.testScheduler.flush();

    await waiter.asObservable().toPromise();
    sinon.assert.calledWith(this.workflowClient.respondDecisionTaskCompleted as any, {
      decisions: [
        {
          completeWorkflowExecutionDecisionAttributes: {
            result: JSON.stringify('test-result'),
          },
          decisionType: 'CompleteWorkflowExecution',
        },
      ],
      taskToken: task.taskToken,
    });
  }


  @test
  async shouldRespondWorkflowFailed() {
    @injectable()
    class TestWf {
      constructor() {
      }

      @workflow()
      @version('1-test')
      async test_wf() {
        throw new Error('Test Error');
      }
    }

    this.binding.impl = TestWf;
    const workflowType = {
      name: 'test_wf',
      version: '1-test',
    };
    const waiter = new Subject();

    this.workflowExecution.workflowType = workflowType;
    this.workflowExecution.setExecutionFailedStateRequestedWith = sinon.spy() as any;

    sinon.stub(this.workflowClient, 'respondDecisionTaskCompleted').callsFake(() => {
      waiter.complete();
      return of({});
    });


    const task = this.pollGenerator.generateTask(
      {
        workflowType,
        events: [this.workflowHistoryGen.createStartedEvent({
          workflowType,
        })],
      },
    );
    const values = {
      a: task,
    };
    this.loadBinding(this.binding);
    this.poller = this.testScheduler.createColdObservable('a|', values);
    this.workflowExecution.currentState = WorkflowExecutionStates.Created;
    this.workflowExecution.onChange = this.testScheduler
      .createColdObservable('--a|', { a: WorkflowExecutionStates.Started });
    const workflowWorker = this.createWorker();
    workflowWorker.startWorker();
    this.testScheduler.flush();

    await waiter.asObservable().toPromise();
    sinon.assert.calledWith(this.workflowClient.respondDecisionTaskCompleted as any, {
      decisions: [
        {
          failWorkflowExecutionDecisionAttributes: {
            details:'error',
            reason:'Test Error',
          },
          decisionType: 'FailWorkflowExecution',
        },
      ],
      taskToken: task.taskToken,
    });
  }

  private createWorker(): WorkflowWorker<any> {
    return new BaseWorkflowWorker<TestWfImpl>(
      this.workflowClient, this.container,
      this.contextCache, this.poller as any, domain, this.binding);
  }

  private loadBinding({ key, impl }: Binding<any>): void {
    this.container.bind(key).to(impl);
  }
}
