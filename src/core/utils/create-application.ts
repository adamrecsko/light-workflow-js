import { Newable } from '../../implementation';
import { ApplicationFactory, ConfigurableApplicationFactory } from '../application/application-factory';
import { BaseApplicationConfigurationProvider } from '../application/application-configuration-provider';
import { getClassLevelDefinitionsFromClass } from './decorators/utils';
import { ApplicationDefinition } from '../application/decorators';

export function createApplication<T>(newable: Newable<T>) {
  const appMeta = getClassLevelDefinitionsFromClass<ApplicationDefinition>(newable);
  const configProvider = new BaseApplicationConfigurationProvider(appMeta.configuration);
  const applicationFactory: ApplicationFactory = new ConfigurableApplicationFactory(configProvider);
  applicationFactory.addImplementations(appMeta.services);
  return applicationFactory.createApplication<T>(newable);
}

