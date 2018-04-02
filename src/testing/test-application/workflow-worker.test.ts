import 'reflect-metadata';
import { suite, test, slow, timeout } from 'mocha-typescript';
import { SWF } from 'aws-sdk';
import { ApplicationFactory, ConfigurableApplicationFactory } from '../../core/application/application-factory';
import {
  ApplicationConfigurationProvider,
  BaseApplicationConfigurationProvider,
} from '../../core/application/application-configuration-provider';
import { ApplicationConfiguration } from '../../core/application/application-configuration';
import { MyApp } from './app';
import { ActivityHistoryGenerator } from '../helpers/activity-history-generator';


import { TEST_ACTOR, TestActorImpl } from './actors/test-actor';
import { TEST_WORKFLOW, TestWorkflowImpl } from './workflows/test-workflow';
import { FakeSWF } from '../mocks/fake-swf';
import { MockSWF } from '../mocks/SWF';
import { expect } from 'chai';
import * as uuid from 'node-uuid';


@suite
class WorkflowWorkerIntegrationTest {
  config: ApplicationConfiguration;
  configProvider: ApplicationConfigurationProvider;
  applicationFactory: ApplicationFactory;
  mockSWF: FakeSWF;
  taskToken: string;

  loadFinishedActivities() {
    const historyGenerator = new ActivityHistoryGenerator();
    historyGenerator.seek(2);


    const transitions = [
      historyGenerator.createActivityScheduledEvent({
        activityId: '0',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 2 }),
      historyGenerator.createActivityTaskCompleted({ result: JSON.stringify('test'), scheduledEventId: 2, startedEventId: 3 }),

      historyGenerator.createActivityScheduledEvent({
        activityId: '1',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 5 }),
      historyGenerator.createActivityTaskCompleted({ result: JSON.stringify('test 2'), scheduledEventId: 5, startedEventId: 6 }),
    ];

    this.mockSWF.setEventList(transitions);

  }

  loadFailedActivities() {
    const historyGenerator = new ActivityHistoryGenerator();
    historyGenerator.seek(2);
    const transitions = [
      historyGenerator.createActivityScheduledEvent({
        activityId: '0',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 2 }),
      historyGenerator.createActivityTaskFailed({ reason: 'error 1', details: 'details', scheduledEventId: 2, startedEventId: 3 }),
    ];
    this.mockSWF.setEventList(transitions);
  }

  before() {

    this.taskToken = uuid.v4();
    this.mockSWF = new FakeSWF(
      [],
      100,
      {
        workflowType: {
          name: 'workflowTest1',
          version: '2',
        },
        taskToken: this.taskToken,
      },
      ['test input'],
    );

    this.config = new ApplicationConfiguration(this.mockSWF as any);
    this.configProvider = new BaseApplicationConfigurationProvider(this.config);
    this.applicationFactory = new ConfigurableApplicationFactory(this.configProvider);

    this.applicationFactory.addImplementations([
      {
        impl: TestActorImpl,
        key: TEST_ACTOR,
      },
      {
        impl: TestWorkflowImpl,
        key: TEST_WORKFLOW,
      },
    ]);

  }

  @test(slow(2000), timeout(10000))
  async shouldRespondWorkflowFinished() {
    this.loadFinishedActivities();
    const app: MyApp = this.applicationFactory.createApplication<MyApp>(MyApp);
    const worker = app.createWorker();
    worker.startWorker();
    await this.mockSWF.completedEventChangeSubject
      .asObservable().take(3).toArray().toPromise();

    const expectedEvents: any = [{
      decisions: [
        {
          decisionType: 'ScheduleActivityTask',
          scheduleActivityTaskDecisionAttributes: {
            activityId: '0',
            activityType: {
              name: 'formatText',
              version: '24-b',
            },
            heartbeatTimeout: undefined,
            input: '["test input"]',
            scheduleToCloseTimeout: undefined,
            scheduleToStartTimeout: undefined,
            startToCloseTimeout: undefined,
            taskList: {
              name: 'default',
            },
          },
        },
      ],
      taskToken: this.taskToken,
    }, {
      decisions: [
        {
          decisionType: 'ScheduleActivityTask',
          scheduleActivityTaskDecisionAttributes: {
            activityId: '1',
            activityType: {
              name: 'printIt',
              version: '24-b',
            },
            heartbeatTimeout: undefined,
            input: '["test"]',
            scheduleToCloseTimeout: undefined,
            scheduleToStartTimeout: undefined,
            startToCloseTimeout: undefined,
            taskList: {
              name: 'default',
            },
          },
        },
      ],
      taskToken: this.taskToken,
    }, {
      decisions: [
        {
          completeWorkflowExecutionDecisionAttributes: {
            result: '"test input:test:test 2"',
          },
          decisionType: 'CompleteWorkflowExecution',
        },
      ],
      taskToken: this.taskToken,
    }];
    expect(this.mockSWF.completedEvents).to.eql(expectedEvents);
  }

  @test(slow(2000), timeout(5000))
  async shouldRespondWorkflowFailed() {
    this.loadFailedActivities();
    const app: MyApp = this.applicationFactory.createApplication<MyApp>(MyApp);
    const worker = app.createWorker();
    worker.startWorker();
    await this.mockSWF.completedEventChangeSubject
      .asObservable().take(2).toArray().toPromise();

    expect(this.mockSWF.completedEvents).to.eql([
      {
        decisions: [
          {
            decisionType: 'ScheduleActivityTask',
            scheduleActivityTaskDecisionAttributes: {
              activityId: '0',
              activityType: {
                name: 'formatText',
                version: '24-b',
              },
              heartbeatTimeout: undefined,
              input: '["test input"]',
              scheduleToCloseTimeout: undefined,
              scheduleToStartTimeout: undefined,
              startToCloseTimeout: undefined,
              taskList: {
                name: 'default',
              },
            },
          },
        ],
        taskToken: this.taskToken,
      },
      {
        decisions: [{
          decisionType: 'FailWorkflowExecution',
          failWorkflowExecutionDecisionAttributes: {
            details: 'details',
            reason: 'Activity failed: error 1 - details',
          },
        }],
        taskToken: this.taskToken,
      },
    ]);
  }

}

