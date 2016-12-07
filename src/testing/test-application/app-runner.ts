import "reflect-metadata";
import {SWF} from 'aws-sdk';
import {ApplicationFactory, ConfigurableApplicationFactory} from "../../application/application-factory";
import {
    ApplicationConfigurationProvider,
    BaseApplicationConfigurationProvider
} from "../../application/application-configuration-provider";
import {ApplicationConfiguration} from "../../application/application-configuration";
import {MyApp} from "./app";
import {HelloImpl, helloSymbol} from "./actors/hello";

const config: ApplicationConfiguration = new ApplicationConfiguration(new SWF());
const configProvider: ApplicationConfigurationProvider = new BaseApplicationConfigurationProvider(config);
const applicationFactory: ApplicationFactory = new ConfigurableApplicationFactory(configProvider);

applicationFactory.addActorImplementations([
    {
        impl: HelloImpl,
        key: helloSymbol
    }
]);

const app: MyApp = applicationFactory.createApplication<MyApp>(MyApp);
app.start();
app.runTheHello('HELLO');