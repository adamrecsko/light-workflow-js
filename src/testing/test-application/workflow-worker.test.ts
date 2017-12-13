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
import { ActivityHistoryGenerator } from '../helpers/workflow-history-generator';
import {
  CANCEL_FAILED_TRANSITION, CANCELLED_TRANSITION, COMPLETED_TRANSITION,
  FAILED_TRANSITION, TIMEOUTED_TRANSITION,
} from '../test-data/normal-transitions';
import { DecisionTask, HistoryEvent } from '../../aws/aws.types';


function createPollForActivityTaskRespond(eventList: HistoryEvent[]): DecisionTask {
  const result: DecisionTask = {
    startedEventId: 1,
    taskToken: 'string',
    workflowExecution: {
      runId: 'string',
      workflowId: 'string',
    },
    workflowType: {
      name: 'string',
      version: 'string',
    },
    events: eventList,
  };

  return result;
}

describe('Test Application', () => {

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


    const list = ActivityHistoryGenerator.generateList([
      COMPLETED_TRANSITION,
    ]);

    const pollResult = createPollForActivityTaskRespond(list);

    pollForDecisionTaskStub = stub().callsArgWith(1, null, pollResult);

    mockSWF.pollForDecisionTask = pollForDecisionTaskStub;


    applicationFactory.addActorImplementations([
      {
        impl: HelloImpl,
        key: helloSymbol,
      },
      {
        impl: HelloWorkflowImpl,
        key: helloWorkflowSymbol,
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


    setTimeout(done, 5000);

  }).timeout(6000);


});
