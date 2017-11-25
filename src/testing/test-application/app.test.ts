import "reflect-metadata";
import {SWF} from 'aws-sdk';
import {ApplicationFactory, ConfigurableApplicationFactory} from "../../core/application/application-factory";
import {
  ApplicationConfigurationProvider,
  BaseApplicationConfigurationProvider
} from "../../core/application/application-configuration-provider";
import {ApplicationConfiguration} from "../../core/application/application-configuration";
import {MyApp} from "./app";
import {HelloImpl, helloSymbol} from "./actors/hello";
import {HelloWorkflowImpl, helloWorkflowSymbol} from "./workflows/hello-world";


describe('Test Application', () => {

  let config: ApplicationConfiguration = new ApplicationConfiguration(new SWF());
  let configProvider: ApplicationConfigurationProvider = new BaseApplicationConfigurationProvider(config);
  let applicationFactory: ApplicationFactory = new ConfigurableApplicationFactory(configProvider);


  beforeEach(() => {
    config = new ApplicationConfiguration(new SWF());
    configProvider = new BaseApplicationConfigurationProvider(config);
    applicationFactory = new ConfigurableApplicationFactory(configProvider);


    applicationFactory.addActorImplementations([
      {
        impl: HelloImpl,
        key: helloSymbol
      },
      {
        impl: HelloWorkflowImpl,
        key: helloWorkflowSymbol
      }
    ]);

    applicationFactory.addWorkflowImplementations([
      {
        impl: HelloWorkflowImpl,
        key: helloWorkflowSymbol
      }
    ]);

  });


  it('should create application', async () => {
    const app: MyApp = applicationFactory.createApplication<MyApp>(MyApp);
    await app.start();
  });

});