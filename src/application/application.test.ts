import "reflect-metadata";

import {
    ConfigurableApplicationFactory, ApplicationConfiguration,
    BaseApplicationConfigurationProvider
} from "./application";
import {injectable, inject} from "inversify";
import {expect} from "chai";
import {WORKFLOW_CLIENT} from "../aws/symbols";
import {WorkflowClient} from "../aws/workflow-client";
import {MockSWF} from "../testing/mocks/SWF";


describe('ConfigurableApplicationFactory', ()=> {
    it('should create application', ()=> {
        const configuration = new ApplicationConfiguration(new MockSWF());
        const configurationProvider = new BaseApplicationConfigurationProvider(configuration);
        const factory = new ConfigurableApplicationFactory(configurationProvider);
        interface App {
        }

        @injectable()
        class AppImp implements App {
            constructor(@inject(WORKFLOW_CLIENT) private wfClient: WorkflowClient) {

            }
        }
        const app = factory.createApplication<App>(AppImp);
        expect(app).to.instanceOf(AppImp);
    });
});