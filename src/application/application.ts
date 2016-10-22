import {Kernel} from "inversify";
import {CORE} from "../core/index";
import {SWF} from "aws-sdk";
import {APPLICATION_CONFIGURATION} from "../aws/symbols";


export class ApplicationConfiguration {
    constructor(public swf: SWF) {
    }
}

export type Implementation<T> = { new(...args: any[]): T; };

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
export interface ApplicationFactory {
    createApplication<T>(applicationClass: T): T
}

export class ConfigurableApplicationFactory implements ApplicationFactory {
    private coreKernel: Kernel;
    private applicationKernel: Kernel;

    constructor(private configurationProvider: ApplicationConfigurationProvider) {
        this.coreKernel = new Kernel();
        this.coreKernel.bind<ApplicationConfigurationProvider>(APPLICATION_CONFIGURATION)
            .toConstantValue(configurationProvider);
        this.coreKernel.load(CORE);
        this.applicationKernel = new Kernel();
        this.applicationKernel.parent = this.coreKernel;
    }

    public createApplication<T>(applicationClass: Implementation<T>): T {
        const applicationSymbol = Symbol('applicationSymbol');
        this.applicationKernel.bind<T>(applicationSymbol).to(applicationClass);
        return this.applicationKernel.get<T>(applicationSymbol);
    }
}

