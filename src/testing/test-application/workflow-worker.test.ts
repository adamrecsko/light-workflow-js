import 'reflect-metadata';
import { SWF } from 'aws-sdk';
import { ApplicationFactory, ConfigurableApplicationFactory } from '../../core/application/application-factory';
import {
  ApplicationConfigurationProvider,
  BaseApplicationConfigurationProvider,
} from '../../core/application/application-configuration-provider';
import { ApplicationConfiguration } from '../../core/application/application-configuration';
import { MyApp } from './app';
import { HelloImpl, helloSymbol } from './actors/hello';
import { HelloWorkflowImpl, helloWorkflowSymbol } from './workflows/hello-world';
import { MockSWF } from '../mocks/SWF';
import { stub } from 'sinon';
import { ActivityHistoryGenerator } from '../helpers/activity-history-generator';
import { WorkflowHistoryGenerator } from '../helpers/workflow-history-generator';
import { BaseWorkflowDecisionPollGenerator, WorkflowDecisionPollGenerator } from '../helpers/workflow-decision-poll-generator';
import { suite, test, slow, timeout } from "mocha-typescript";


@suite
class WorkflowWorkerIntegrationTest {
  config: ApplicationConfiguration;
  configProvider: ApplicationConfigurationProvider;
  applicationFactory: ApplicationFactory;
  mockSWF: MockSWF;


  before() {
    this.mockSWF = new MockSWF();
    this.config = new ApplicationConfiguration(this.mockSWF as SWF);
    this.configProvider = new BaseApplicationConfigurationProvider(this.config);
    this.applicationFactory = new ConfigurableApplicationFactory(this.configProvider);
    const workflowEventGenerator = new WorkflowHistoryGenerator();
    const historyGenerator = new ActivityHistoryGenerator();
    const workflowPollGenerator: WorkflowDecisionPollGenerator = new BaseWorkflowDecisionPollGenerator();
    historyGenerator.seek(2);
    historyGenerator.activityType = { name: 'formatText', version: '23-b' };
    const helloActivityTransition = [
      historyGenerator.createActivityScheduledEvent({
        input: JSON.stringify(['this is a test input']),
        activityId: '0',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 2 }),
      historyGenerator.createActivityTaskCompleted({ result: JSON.stringify('halihoo'), scheduledEventId: 2, startedEventId: 3 }),

      historyGenerator.createActivityScheduledEvent({
        input: JSON.stringify('Test input 2'),
        activityId: '1',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 5 }),
      historyGenerator.createActivityTaskCompleted({ result: JSON.stringify('halihooo 2'), scheduledEventId: 5, startedEventId: 6 }),
    ];

    const events = [
      workflowEventGenerator.createStartedEvent({
        input: JSON.stringify(['this is a test input']),
        workflowType: {
          name: 'helloWorld',
          version: '1',
        },
      }),
      ...helloActivityTransition,
    ];

    const pollResult = workflowPollGenerator.generateTask({
      events,
      nextPageToken: null,
      startedEventId: 1,
      workflowType: {
        name: 'helloWorld',
        version: '1',
      },
    });

    this.mockSWF.pollForDecisionTask = stub().callsArgWith(1, null, pollResult);

    this.applicationFactory.addActorImplementations([
      {
        impl: HelloImpl,
        key: helloSymbol,
      },
    ]);

    this.applicationFactory.addWorkflowImplementations([
      {
        impl: HelloWorkflowImpl,
        key: helloWorkflowSymbol,
      },
    ]);
  }

  @test(slow(2000), timeout(4000))
  shouldStartWorker(done: any) {
    const app: MyApp = this.applicationFactory.createApplication<MyApp>(MyApp);
    try {
      const worker = app.createWorker();
      worker.startWorker();
    } catch (error) {
      console.error(error);
    }
    setTimeout(done, 500);
  }
}

