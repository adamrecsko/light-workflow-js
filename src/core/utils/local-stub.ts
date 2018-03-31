import { Newable } from '../../implementation';
import { AbstractDecoratorDefinition } from './decorators/abstract-decorator-definition';
import { getDefinitionsFromClass } from './decorators/utils';
import { Observable } from 'rxjs/Observable';

export type NameAndVersion = {
  name: string,
  version: string,
};

export class DesiredMethodDoesNotAvailable extends Error {

}


export class LocalStub {

  private workflowToDefinition: Map<string, AbstractDecoratorDefinition> = new Map();

  constructor(private clazz: Newable<object>, private instance: any) {
    const definitions = getDefinitionsFromClass<AbstractDecoratorDefinition>(clazz);
    definitions.forEach((definition: AbstractDecoratorDefinition) => this.storeDefinition(definition));
  }

  public isWorkflowExists({ name, version }: NameAndVersion): boolean {
    return this.workflowToDefinition.has(LocalStub.createKey({ name, version }));
  }

  public callWorkflowWithInput({ name, version }: NameAndVersion, input: string): Promise<any> | Observable<any> {
    if (this.isWorkflowExists({ name, version })) {
      const definition = this.getDefinition({ name, version });
      const methodProxy = this.getMethodProxyForDefinition(definition);
      const result = methodProxy(input);

      if (result instanceof Promise) {
        return result.then((res) => {
          console.log('call Finished:', res);
          return definition.serializer.stringify(res);
        });
      }

      if (result instanceof Observable) {
        return result.map((res) => {
          console.log('call Finished:', res);
          return definition.serializer.stringify(res);
        });
      }
    }
    throw new DesiredMethodDoesNotAvailable(LocalStub.createKey({ name, version }));
  }

  private storeDefinition(definition: AbstractDecoratorDefinition) {
    this.workflowToDefinition.set(LocalStub.createKey(definition), definition);
  }

  private static createKey({ name, version }: NameAndVersion): string {
    return `${name}${version}`;
  }

  private getDefinition({ name, version }: NameAndVersion): AbstractDecoratorDefinition {
    return this.workflowToDefinition.get(LocalStub.createKey({ name, version }));
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
