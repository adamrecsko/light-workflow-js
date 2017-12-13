import { Container, ContainerModule } from 'inversify';
import { APPLICATION_CONFIGURATION, APP_CONTAINER, ACTIVITY_CLIENT_IMPLEMENTATION_HELPER } from '../../symbols';
import { ApplicationConfigurationProvider } from './application-configuration-provider';
import { CORE } from '../../core-module';
import { Newable } from '../../implementation';
import { Binding, ImplementationHelper } from '../generics/implementation-helper';
import { WORKFLOW_CLIENT_IMPLEMENTATION_HELPER } from '../workflow/workflow-client-implementation-helper';

export interface ApplicationFactory {
  createApplication<T>(application: Newable<T>): T;

  addActorImplementations(implementationList: Binding[]): void;

  addWorkflowImplementations(implementationList: Binding[]): void;
}


interface ApplicationBuilder<T> {
  setConfiguration(configurationProvider: ApplicationConfigurationProvider): this;
  setModules(modules: ContainerModule[]): this;
  setActors(actorBinding: Binding[]): this;
  setApplicationClass(application: Newable<T>): this;
  createApplication(): T;
}


export class ConfigurableApplicationFactory implements ApplicationFactory {
  private coreKernel: Container;
  private applicationKernel: Container;
  private actorClientImplementationHelper: ImplementationHelper;
  private workflowImplementationHelper: ImplementationHelper;

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
      this.coreKernel.get<ImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER);
    this.workflowImplementationHelper = this.coreKernel.get<ImplementationHelper>(WORKFLOW_CLIENT_IMPLEMENTATION_HELPER);
  }

  public addActorImplementations(implementationList: Binding[]): void {
    this.actorClientImplementationHelper.addImplementations(implementationList);
  }

  public addWorkflowImplementations(implementationList: Binding[]): void {
    this.workflowImplementationHelper.addImplementations(implementationList);
  }

  public createApplication<T>(application: Newable<T>): T {
    const applicationSymbol = Symbol('applicationSymbol');
    this.applicationKernel.bind<T>(applicationSymbol).to(application);
    return this.applicationKernel.get<T>(applicationSymbol);
  }
}

