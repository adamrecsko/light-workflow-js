import 'reflect-metadata';
import { SWF } from 'aws-sdk';
import { ApplicationFactory, ConfigurableApplicationFactory } from '../../core/application/application-factory';
import {
  ApplicationConfigurationProvider,
  BaseApplicationConfigurationProvider,
} from '../../core/application/application-configuration-provider';
import { ApplicationConfiguration } from '../../core/application/application-configuration';
import { MyApp } from './app';
import { TEST_ACTOR, TestActorImpl } from './actors/test-actor';
import { TEST_WORKFLOW, TestWorkflowImpl } from './workflows/test-workflow';
import { MockSWF } from '../mocks/SWF';
import { stub, assert, match } from 'sinon';
import { expect } from 'chai';


describe('Test Application', () => {

  let config: ApplicationConfiguration;
  let configProvider: ApplicationConfigurationProvider;
  let applicationFactory: ApplicationFactory;
  let mockSWF: MockSWF;
  let startWfStub: any;
  let registerWfStub: any;

  const testRunId = {
    runId: 'test-run-id',
  };
  beforeEach(() => {

    mockSWF = new MockSWF();
    config = new ApplicationConfiguration(mockSWF as SWF);
    configProvider = new BaseApplicationConfigurationProvider(config);
    applicationFactory = new ConfigurableApplicationFactory(configProvider);
    startWfStub = stub().callsArgWith(1, null, testRunId);
    registerWfStub = stub().callsArgWith(1, null);
    mockSWF.startWorkflowExecution = startWfStub;
    mockSWF.registerWorkflowType = registerWfStub;
    applicationFactory.addImplementations([
      {
        impl: TestActorImpl,
        key: TEST_ACTOR,
      },
      {
        impl: TestWorkflowImpl,
        key: TEST_WORKFLOW,
      },
    ]);
  });

  it('should return runId', async () => {
    const app: MyApp = applicationFactory.createApplication<MyApp>(MyApp);
    const runId = await app.start();
    expect(runId).to.eq(testRunId.runId);
  });

  it('should call aws to start a workflow', async () => {
    const app: MyApp = applicationFactory.createApplication<MyApp>(MyApp);
    await app.start();
    assert.called(startWfStub);
  });

  it('should register workflow', async () => {
    const app: MyApp = applicationFactory.createApplication<MyApp>(MyApp);
    await app.registerWorkflows();

    assert.calledWith(
      registerWfStub.getCall(0),
      match({
        name: 'workflowTest1',
        version: '2',
        domain: MyApp.domain,
      }),
      match.func);

    assert.calledWith(
      registerWfStub.getCall(1),
      match({
        name: 'workflowTest2',
        version: '3',
        domain: MyApp.domain,
        defaultExecutionStartToCloseTimeout: '13',
      }),
      match.func);
  });
});
