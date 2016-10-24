import {Kernel} from "inversify";
import {CORE, ACTIVITY_CLIENT_IMPLEMENTATION_HELPER} from "../core/index";
import {SWF} from "aws-sdk";
import {APPLICATION_CONFIGURATION} from "../aws/symbols";
import {ActivityClientImplementationHelper} from "./activity-client-implementation-helper";


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

export const APP_KERNEL = Symbol('APP_KERNEL');

export class ConfigurableApplicationFactory implements ApplicationFactory {
    private coreKernel: Kernel;
    private applicationKernel: Kernel;
    private activityClientImplementationHelper: ActivityClientImplementationHelper;

    constructor(private configurationProvider: ApplicationConfigurationProvider) {
        this.coreKernel = new Kernel();
        this.applicationKernel = new Kernel();
        this.applicationKernel.parent = this.coreKernel;
        this.coreKernel
            .bind<ApplicationConfigurationProvider>(APPLICATION_CONFIGURATION)
            .toConstantValue(configurationProvider);
        this.coreKernel.bind<Kernel>(APP_KERNEL)
            .toConstantValue(this.applicationKernel);
        this.coreKernel.load(CORE);
        this.activityClientImplementationHelper =
            this.coreKernel.get<ActivityClientImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER);
    }

    public createApplication<T>(applicationClass: Implementation<T>): T {
        const applicationSymbol = Symbol('applicationSymbol');
        this.applicationKernel.bind<T>(applicationSymbol).to(applicationClass);
        return this.applicationKernel.get<T>(applicationSymbol);
    }
}

