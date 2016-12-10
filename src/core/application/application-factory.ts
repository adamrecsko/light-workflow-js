import {Container} from "inversify";
import {APPLICATION_CONFIGURATION, APP_CONTAINER, ACTIVITY_CLIENT_IMPLEMENTATION_HELPER} from "../../symbols";
import {ApplicationConfigurationProvider} from "./application-configuration-provider";
import {CORE} from "../../core-module";
import {ActorClientImplementationHelper, Binding} from "../actor/helpers/actor-client-implementation-helper";
import {Newable} from "../../implementation";
import {ContainerModule} from "inversify";

export interface ApplicationFactory {
    createApplication<T>(application: Newable<T>): T;
    addActorImplementations(implementationList: Binding[]): void;
}


interface ApplicationBuilder<T> {
    setConfiguration(configurationProvider: ApplicationConfigurationProvider): ApplicationBuilder<T>;
    setModules(modules: ContainerModule[]): ApplicationBuilder<T>;
    setActors(actorBinding: Binding[]): ApplicationBuilder<T>;
    setApplicationClass(application: Newable<T>): ApplicationBuilder<T>;
    createApplication(): T;
}


export class ConfigurableApplicationFactory implements ApplicationFactory {
    private coreKernel: Container;
    private applicationKernel: Container;
    private actorClientImplementationHelper: ActorClientImplementationHelper;

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
        this.actorClientImplementationHelper =
            this.coreKernel.get<ActorClientImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER);
    }

    public addActorImplementations(implementationList: Binding[]): void {
        this.actorClientImplementationHelper.addImplementations(implementationList);
    }

    public createApplication<T>(application: Newable<T>): T {
        const applicationSymbol = Symbol('applicationSymbol');
        this.applicationKernel.bind<T>(applicationSymbol).to(application);
        return this.applicationKernel.get<T>(applicationSymbol);
    }
}

