import {Container} from "inversify";
import {APPLICATION_CONFIGURATION, APP_CONTAINER, ACTIVITY_CLIENT_IMPLEMENTATION_HELPER} from "../symbols";
import {ApplicationConfigurationProvider} from "./application-configuration-provider";
import {CORE} from "./core-module";
import {ActorClientImplementationHelper, Binding} from "./actor/helpers/actor-client-implementation-helper";
import {Class} from "../implementation";
import {ContainerModule} from "inversify";

export interface ApplicationFactory {
    createApplication<T>(applicationClass: T): T;
}


interface ApplicationBuilder<T> {
    setConfiguration(configurationProvider: ApplicationConfigurationProvider): ApplicationBuilder<T>;
    setModules(modules: ContainerModule[]): ApplicationBuilder<T>;
    setActors(actorBinding: Binding[]): ApplicationBuilder<T>;
    setApplicationClass(application: Class<T>): ApplicationBuilder<T>;
    createApplication(): T;
}


export class ConfigurableApplicationFactory implements ApplicationFactory {
    private coreKernel: Container;
    private applicationKernel: Container;
    private activityClientImplementationHelper: ActorClientImplementationHelper;

    constructor(private configurationProvider: ApplicationConfigurationProvider) {
        this.coreKernel = new Container();
        this.applicationKernel = new Container();
        this.applicationKernel.parent = this.coreKernel;
        this.coreKernel
            .bind(APPLICATION_CONFIGURATION)
            .toConstantValue(configurationProvider);
        this.coreKernel.bind<Container>(APP_CONTAINER)
            .toConstantValue(this.applicationKernel);
        this.coreKernel.load(CORE);
        this.activityClientImplementationHelper =
            this.coreKernel.get<ActorClientImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER);
    }

    public createApplication<T>(application: Class<T>): T {
        const applicationSymbol = Symbol('applicationSymbol');
        this.applicationKernel.bind<T>(applicationSymbol).to(application);
        return this.applicationKernel.get<T>(applicationSymbol);
    }
}

