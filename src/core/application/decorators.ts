import { Binding } from '../generics/implementation-helper';
import { ApplicationConfiguration } from './application-configuration';
import { classLevelDefinition } from '../utils/decorators/utils';

export class ApplicationDefinition {
  public configuration: ApplicationConfiguration;
  public services: Binding[];

}

function createDecorator<T>(property: keyof ApplicationDefinition) {
  return classLevelDefinition<T, ApplicationDefinition>(property, ApplicationDefinition);
}

export const configuration = createDecorator<ApplicationConfiguration>('configuration');
export const services = createDecorator<Binding[]>('services');
