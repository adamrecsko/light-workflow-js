import { suite, test } from 'mocha-typescript';
import { BaseActorWorker } from './actor-worker';
import { WorkflowClient } from '../../../aws/workflow-client';
import { MockWorkflowClient } from '../../../testing/mocks/workflow-client';
import { ActivityTask } from '../../../aws/aws.types';
import { Binding } from '../../generics/implementation-helper';
import { Container, injectable } from 'inversify';
import { Observable } from 'rxjs/Observable';
import {
  activity, defaultTaskHeartbeatTimeout, defaultTaskList, defaultTaskPriority, defaultTaskScheduleToCloseTimeout, defaultTaskScheduleToStartTimeout, defaultTaskStartToCloseTimeout, description,
  heartbeatTimeout, scheduleToCloseTimeout, scheduleToStartTimeout, serializer, startToCloseTimeout, taskPriority,
  version, name,
} from '../activity/decorators/activity-decorators';
import { of } from 'rxjs/observable/of';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { TestLogger } from '../../../testing/mocks/test-logger';

@suite
class ActorWorkerTest {
  private workflowClient: WorkflowClient;
  private domain = 'test-domain';
  private binding: Binding;
  private activityPoller: Observable<ActivityTask>;
  private container: Container;

  before() {
    this.workflowClient = new MockWorkflowClient();
    this.workflowClient.registerActivityType = sinon.stub().returns(of());
    this.binding = ActorWorkerTest.createBinding();
    this.container = new Container();
    this.container.bind(this.binding.key).to(this.binding.impl);

    this.workflowClient.respondActivityTaskCompleted = sinon.stub().returns(Observable.empty());
    this.workflowClient.respondActivityTaskFailed = sinon.stub().returns(Observable.empty());
  }


  @test
  registerShouldRegisterAllActivityOnTheActor() {
    const worker = this.createWorker();
    worker.register().subscribe();
    const expectedCalls: any = [
      [
        {
          defaultTaskHeartbeatTimeout: '10',
          defaultTaskList: { name: 'default' },
          defaultTaskPriority: '0',
          defaultTaskScheduleToCloseTimeout: '30',
          defaultTaskScheduleToStartTimeout: '5',
          defaultTaskStartToCloseTimeout: '20',
          description: undefined,
          domain: 'test-domain',
          name: 'testActivity1',
          version: '1',
        },
      ], [
        {
          defaultTaskHeartbeatTimeout: '1234',
          defaultTaskList: {
            name: 'def-task-list',
          },
          defaultTaskPriority: 'def task pri',
          defaultTaskScheduleToCloseTimeout: '2',
          defaultTaskScheduleToStartTimeout: '3',
          defaultTaskStartToCloseTimeout: '4',
          description: 'desc',
          domain: 'test-domain',
          name: 'test-activity',
          version: '7',
        },
      ],
      [
        {
          defaultTaskHeartbeatTimeout: '10',
          defaultTaskList: {
            name: 'default',
          },
          defaultTaskPriority: '0',
          defaultTaskScheduleToCloseTimeout: '30',
          defaultTaskScheduleToStartTimeout: '5',
          defaultTaskStartToCloseTimeout: '20',
          description: undefined,
          domain: 'test-domain',
          name: 'testActivity3',
          version: '1',
        },
      ],
      [
        {
          defaultTaskHeartbeatTimeout: '10',
          defaultTaskList: {
            name: 'default',
          },
          defaultTaskPriority: '0',
          defaultTaskScheduleToCloseTimeout: '30',
          defaultTaskScheduleToStartTimeout: '5',
          defaultTaskStartToCloseTimeout: '20',
          description: undefined,
          domain: 'test-domain',
          name: 'testActivity4',
          version: '1',
        },
      ],
    ];
    const callArgs = (this.workflowClient.registerActivityType as sinon.SinonStub).args;
    expect(callArgs).to.eql(expectedCalls);
  }

  @test
  shouldRespondWithActivityFinished() {

    const task: Partial<ActivityTask> = {
      taskToken: '123456678',
      activityType: {
        name: 'testActivity1',
        version: '1',
      },
      input: JSON.stringify(['test1', 'test2']),
    };

    this.activityPoller = of(task as ActivityTask);
    const worker = this.createWorker();
    worker.startWorker();
    sinon.assert.calledWith(this.workflowClient.respondActivityTaskCompleted as any, {
      result: '"test1test2"',
      taskToken: '123456678',
    });

  }

  @test
  shouldRespondWithActivityFailed() {
    const task: Partial<ActivityTask> = {
      taskToken: '123456678',
      activityType: {
        name: 'testActivity3',
        version: '1',
      },
    };

    this.activityPoller = of(task as ActivityTask);
    const worker = this.createWorker();
    worker.startWorker();
    sinon.assert.calledWith(this.workflowClient.respondActivityTaskFailed as any, {
      reason: 'test error',
      details: undefined,
      taskToken: '123456678',
    });
  }

  @test
  shouldRespondWithActivityFailedIfMethodThrowError() {
    const task: Partial<ActivityTask> = {
      taskToken: '123456678',
      activityType: {
        name: 'testActivity4',
        version: '1',
      },
    };

    this.activityPoller = of(task as ActivityTask);
    const worker = this.createWorker();
    worker.startWorker();
    sinon.assert.calledWith(this.workflowClient.respondActivityTaskFailed as any, {
      reason: 'boom',
      details: undefined,
      taskToken: '123456678',
    });
  }


  private createWorker() {
    return new BaseActorWorker(this.workflowClient, this.domain, this.container, this.activityPoller as any, this.binding, new TestLogger());
  }

  private static createBinding(): Binding<any> {
    const sym = Symbol('test-activity-symbol');

    @injectable()
    class TestActivity {

      @activity()
      public testActivity1(txt: string, txt2: string): Observable<string> {
        return of(txt + txt2);
      }

      @activity()
      @name('test-activity')
      @version('7')
      @defaultTaskHeartbeatTimeout('1234')
      @defaultTaskList({ name: 'def-task-list' })
      @defaultTaskPriority('def task pri')
      @defaultTaskScheduleToCloseTimeout('2')
      @defaultTaskScheduleToStartTimeout('3')
      @defaultTaskStartToCloseTimeout('4')
      @description('desc')
      @heartbeatTimeout('5')
      @scheduleToCloseTimeout('7')
      @scheduleToStartTimeout('8')
      @startToCloseTimeout('9')
      @taskPriority('1 task')
      @serializer(JSON)
      public testActivity2(i: number): Observable<number> {
        return of(i + 1);
      }

      @activity()
      public testActivity3(): Observable<number> {
        return Observable.throw(new Error('test error'));
      }

      @activity()
      public testActivity4(): any {
        throw new Error('boom');
      }

    }

    return {
      impl: TestActivity,
      key: sym,
    };
  }
}
