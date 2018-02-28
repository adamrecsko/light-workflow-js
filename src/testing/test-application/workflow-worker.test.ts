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
import { helloWorkflowSymbol, test } from './workflows/hello-world';
import HelloWorkflowImpl = test.HelloWorkflowImpl;
import { MockSWF } from '../mocks/SWF';
import { stub, assert, match } from 'sinon';
import { expect } from 'chai';
import { ActivityHistoryGenerator } from '../helpers/activity-history-generator';
import {
  CANCEL_FAILED_TRANSITION, CANCELLED_TRANSITION, COMPLETED_TRANSITION,
  FAILED_TRANSITION, TIMEOUTED_TRANSITION,
} from '../test-data/normal-transitions';
import { DecisionTask, HistoryEvent } from '../../aws/aws.types';
import { WorkflowHistoryGenerator } from '../helpers/workflow-history-generator';


function createPollForActivityTaskRespond(eventList: HistoryEvent[]): DecisionTask {
  const result: DecisionTask = {
    startedEventId: 1,
    taskToken: 'string',
    workflowExecution: {
      runId: 'string',
      workflowId: 'string',
    },
    workflowType: {
      name: 'helloWorld',
      version: '1',
    },
    events: eventList,
  };

  return result;
}

describe('Test Application Worker', () => {

  let config: ApplicationConfiguration;
  let configProvider: ApplicationConfigurationProvider;
  let applicationFactory: ApplicationFactory;
  let mockSWF: MockSWF;
  let pollForDecisionTaskStub: any;


  const testRunId = {
    runId: 'test-run-id',
  };
  beforeEach(() => {

    mockSWF = new MockSWF();
    config = new ApplicationConfiguration(mockSWF as SWF);
    configProvider = new BaseApplicationConfigurationProvider(config);
    applicationFactory = new ConfigurableApplicationFactory(configProvider);
    const workflowEventGenerator = new WorkflowHistoryGenerator();
    const historyGenerator = new ActivityHistoryGenerator();
    historyGenerator.seek(2);


    historyGenerator.activityType = { "name": "formatText", "version": "23-b" };
    const helloActivityTransition = [
      historyGenerator.createActivityScheduledEvent({
        input: JSON.stringify(['this is a test input']),
        activityId: '0',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 2 }),
      historyGenerator.createActivityTaskCompleted({ result: JSON.stringify('halihoo'), scheduledEventId: 2, startedEventId: 3 }),

      historyGenerator.createActivityScheduledEvent({
        input: JSON.stringify('halihoo'),
        activityId: '1',
      }),
      historyGenerator.createActivityTaskStarted({ scheduledEventId: 5 }),
      historyGenerator.createActivityTaskCompleted({ result: JSON.stringify('halihooo 2'), scheduledEventId: 5, startedEventId: 6 }),
    ];

    const pollResult = createPollForActivityTaskRespond([
      workflowEventGenerator.createStartedEvent({
        input: JSON.stringify(['this is a test input']),
        workflowType: {
          name: 'helloWorld',
          version: '1',
        },
      }),
      ...helloActivityTransition,

    ]);

    pollForDecisionTaskStub = stub().callsArgWith(1, null, pollResult);

    mockSWF.pollForDecisionTask = pollForDecisionTaskStub;


    applicationFactory.addActorImplementations([
      {
        impl: HelloImpl,
        key: helloSymbol,
      },
    ]);

    applicationFactory.addWorkflowImplementations([
      {
        impl: HelloWorkflowImpl,
        key: helloWorkflowSymbol,
      },
    ]);
  });

  it('should start worker', (done) => {
    const app: MyApp = applicationFactory.createApplication<MyApp>(MyApp);
    const worker = app.createWorker();
    worker.startWorker();
    setTimeout(done, 3000);
  }).timeout(6000);

});
