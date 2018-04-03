import { Container } from 'inversify';
import { APPLICATION_CONFIGURATION, APP_CONTAINER } from '../../symbols';
import { ApplicationConfigurationProvider } from './application-configuration-provider';
import { CORE } from '../../core-module';
import { Newable } from '../../implementation';
import { Binding, IMPLEMENTATION_HELPER, ImplementationHelper } from '../generics/implementation-helper';

export interface ApplicationFactory {
  createApplication<T>(application: Newable<T>): T;

  addImplementations(implementationList: Binding[]): void;

}

export class ConfigurableApplicationFactory implements ApplicationFactory {
  private readonly coreKernel: Container;
  private readonly applicationKernel: Container;
  private implementationHelper: ImplementationHelper;


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
    this.implementationHelper =
      this.coreKernel.get<ImplementationHelper>(IMPLEMENTATION_HELPER);
  }

  public addImplementations(implementationList: Binding[]): void {
    this.implementationHelper.addImplementations(implementationList);
  }

  public createApplication<T>(application: Newable<T>): T {
    const applicationSymbol = Symbol('applicationSymbol');
    this.applicationKernel.bind<T>(applicationSymbol).to(application);
    return this.applicationKernel.get<T>(applicationSymbol);
  }
}

