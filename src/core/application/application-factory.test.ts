import "reflect-metadata";

import {injectable, inject} from "inversify";
import {expect} from "chai";
import {WorkflowClient} from "../../aws/workflow-client";
import {MockSWF} from "../../testing/mocks/SWF";
import {ApplicationConfiguration} from "./application-configuration";
import {BaseApplicationConfigurationProvider} from "./application-configuration-provider";
import {ConfigurableApplicationFactory} from "./application-factory";
import {WORKFLOW_CLIENT} from "../../symbols";
import {SWF} from 'aws-sdk';


describe('ConfigurableApplicationFactory', ()=> {
    it('should create application', ()=> {
      const configuration = new ApplicationConfiguration(new MockSWF() as SWF);
        const configurationProvider = new BaseApplicationConfigurationProvider(configuration);
        const factory = new ConfigurableApplicationFactory(configurationProvider);
        interface App {
        }

        @injectable()
        class AppImp implements App {
            constructor(@inject(WORKFLOW_CLIENT) private wfClient: WorkflowClient) {

            }
        }
        const app: App = factory.createApplication<App>(AppImp);
        expect(app).to.instanceOf(AppImp);
    });
});