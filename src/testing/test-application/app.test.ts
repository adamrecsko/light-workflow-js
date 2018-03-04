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
import { stub, assert, match } from 'sinon';
import { expect } from 'chai';


describe.skip('Test Application', () => {

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

    assert.calledWith(registerWfStub.getCall(0), match({
      name: 'helloWorld',
      version: '1',
      domain: 'test-domain',
    }),               match.func);

    assert.calledWith(registerWfStub.getCall(1), match({
      name: 'halloWorld',
      version: '7-test',
      domain: 'test-domain',
      defaultExecutionStartToCloseTimeout: '13',
    }),               match.func);

  });
});
