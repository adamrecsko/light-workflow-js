import { Newable } from '../../implementation';
import { AbstractDecoratorDefinition } from './decorators/abstract-decorator-definition';
import { getPropertyLevelDefinitionsFromClass } from './decorators/utils';
import { Observable } from 'rxjs/Observable';
import { Logger } from '../logging/logger';
import { Binding } from '../generics/implementation-helper';
import { Container } from 'inversify';

export type NameAndVersion = {
  name: string,
  version: string,
};

export class DesiredMethodDoesNotAvailable extends Error {

}

export interface LocalStub {

  isMethodExists({ name, version }: NameAndVersion): boolean;

  callMethodWithInput({ name, version }: NameAndVersion, input: string): Promise<any> | Observable<any>;
}

export class SingleInstanceLocalStub implements LocalStub {

  private methodDefinitions: Map<string, AbstractDecoratorDefinition> = new Map();

  constructor(private clazz: Newable<object>, private instance: any, private logger: Logger) {
    const definitions = getPropertyLevelDefinitionsFromClass<AbstractDecoratorDefinition>(clazz);
    definitions.forEach((definition: AbstractDecoratorDefinition) => this.storeDefinition(definition));
  }

  public isMethodExists({ name, version }: NameAndVersion): boolean {
    return this.methodDefinitions.has(SingleInstanceLocalStub.createKey({ name, version }));
  }

  public callMethodWithInput({ name, version }: NameAndVersion, input: string): Promise<any> | Observable<any> {
    if (this.isMethodExists({ name, version })) {
      const definition = this.getDefinition({ name, version });
      const methodProxy = this.getMethodProxyForDefinition(definition);
      const result = methodProxy(input);

      if (result instanceof Promise) {
        return result.then((res) => {
          this.logger.info('Call Finished on promise with: %s', res);
          return definition.serializer.stringify(res);
        });
      }

      if (result instanceof Observable) {
        return result.map((res) => {
          this.logger.info('Call Finished on observable with: %s', res);
          return definition.serializer.stringify(res);
        });
      }
    }
    throw new DesiredMethodDoesNotAvailable(SingleInstanceLocalStub.createKey({ name, version }));
  }

  private storeDefinition(definition: AbstractDecoratorDefinition) {
    this.methodDefinitions.set(SingleInstanceLocalStub.createKey(definition), definition);
  }

  private static createKey({ name, version }: NameAndVersion): string {
    return `${name}${version}`;
  }

  private getDefinition({ name, version }: NameAndVersion): AbstractDecoratorDefinition {
    return this.methodDefinitions.get(SingleInstanceLocalStub.createKey({ name, version }));
  }

  private getMethodProxyForDefinition(definition: AbstractDecoratorDefinition): (input: string) => any {
    const methodName = definition.decoratedMethodName;
    const instance: any = this.instance;
    const method: Function = instance[methodName] as Function;
    const serializer = definition.serializer;
    return (input: string) => {
      const params = input ? serializer.parse(input) : [];
      return method.apply(instance, params);
    };
  }
}


export class LocalMultiBindingStub implements LocalStub {
  private stubs: LocalStub[] = [];

  constructor(private container: Container, private bindings: Binding[], private logger: Logger) {
    bindings.forEach((binding) => {
      const instance = this.container.get(binding.key);
      this.stubs.push(new SingleInstanceLocalStub(binding.impl, instance, logger));
    });
  }


  isMethodExists({ name, version }: NameAndVersion): boolean {
    return !!this.getStub({ name, version });
  }

  callMethodWithInput({ name, version }: NameAndVersion, input: string): Promise<any> | Observable<any> {
    const stub = this.getStub({ name, version });
    if (stub) {
      return stub.callMethodWithInput({ name, version }, input);
    }
    throw new DesiredMethodDoesNotAvailable(`${name}${version}`);
  }

  private getStub({ name, version }: NameAndVersion): LocalStub {
    return this.stubs.find(stub => stub.isMethodExists({ name, version }));
  }

}

