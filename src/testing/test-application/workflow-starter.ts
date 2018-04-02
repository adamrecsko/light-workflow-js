import 'reflect-metadata';

import { TEST_ACTOR, TestActorImpl } from './actors/test-actor';
import { BaseApplicationConfigurationProvider } from '../../core/application/application-configuration-provider';
import { ConfigurableApplicationFactory } from '../../core/application/application-factory';
import { SWF } from 'aws-sdk';
import { TEST_WORKFLOW, TestWorkflowImpl } from './workflows/test-workflow';
import { ApplicationConfiguration } from '../../core/application/application-configuration';
import { MyApp } from './app';

const swf = new SWF({ region: 'us-east-1' });
const config = new ApplicationConfiguration(swf);
const configProvider = new BaseApplicationConfigurationProvider(config);
const applicationFactory = new ConfigurableApplicationFactory(configProvider);
applicationFactory.addActorImplementations([
  {
    impl: TestActorImpl,
    key: TEST_ACTOR,
  },
]);

applicationFactory.addWorkflowImplementations([
  {
    impl: TestWorkflowImpl,
    key: TEST_WORKFLOW,
  },
]);


async function boot() {

  const app = applicationFactory.createApplication<MyApp>(MyApp);


  for (let i = 0; i < 100; i++) {
    const res =   app.start();
    console.log(res);
  }

}

boot().catch(err => console.error(err));





