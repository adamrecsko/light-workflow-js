import {ApplicationConfiguration} from "./application-configuration";
export interface ApplicationConfigurationProvider {
    getConfiguration(): ApplicationConfiguration
}

export class BaseApplicationConfigurationProvider implements ApplicationConfigurationProvider {
    constructor(private configuration: ApplicationConfiguration) {
    }

    getConfiguration(): ApplicationConfiguration {
        return this.configuration;
    }
}