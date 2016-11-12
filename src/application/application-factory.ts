import {Kernel} from "inversify";
import {APPLICATION_CONFIGURATION, APP_KERNEL, ACTIVITY_CLIENT_IMPLEMENTATION_HELPER} from "../symbols";
import {ApplicationConfigurationProvider} from "./application-configuration-provider";
import {CORE} from "./core-module";
import {ActorClientImplementationHelper} from "./actor/helpers/actor-client-implementation-helper";
import {Implementation} from "../implementation";

export interface ApplicationFactory {
    createApplication<T>(applicationClass: T): T;
}

export class ConfigurableApplicationFactory implements ApplicationFactory {
    private coreKernel: Kernel;
    private applicationKernel: Kernel;
    private activityClientImplementationHelper: ActorClientImplementationHelper;

    constructor(private configurationProvider: ApplicationConfigurationProvider) {
        this.coreKernel = new Kernel();
        this.applicationKernel = new Kernel();
        this.applicationKernel.parent = this.coreKernel;
        this.coreKernel
            .bind(APPLICATION_CONFIGURATION)
            .toConstantValue(configurationProvider);
        this.coreKernel.bind<Kernel>(APP_KERNEL)
            .toConstantValue(this.applicationKernel);
        this.coreKernel.load(CORE);
        this.activityClientImplementationHelper =
            this.coreKernel.get(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER);
    }

    public createApplication<T>(applicationClass: Implementation<T>): T {
        const applicationSymbol = Symbol('applicationSymbol');
        this.applicationKernel.bind<T>(applicationSymbol).to(applicationClass);
        return this.applicationKernel.get<T>(applicationSymbol);
    }
}

