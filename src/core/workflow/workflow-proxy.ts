import { WorkflowDefinition } from './workflow-definition';
import { getDefinitionsFromClass } from '../utils/decorators/utils';
import { Newable } from '../../implementation';
import { DecisionRunContext } from '../context/decision-run-context';

export class RemoteWorkflowStub<T> {

  [key: string]: any;

  constructor(private workflowDefinition: WorkflowDefinition[]) {
    workflowDefinition.forEach((definition: WorkflowDefinition) => {
      this[definition.decoratedMethodName] = definition;
    });
  }
}

export class WorkflowDoesNotExistsException extends Error {

}

export class LocalWorkflowStub<T> {

  private workflowToDefinition: Map<string, WorkflowDefinition> = new Map();

  constructor(private clazz: Newable<T>, private instance: T) {
    const definitions = getDefinitionsFromClass(clazz);
    definitions.forEach((definition: WorkflowDefinition) => this.storeDefinition(definition));
  }

  public isWorkflowExists({ name, version }: Partial<WorkflowDefinition>): boolean {
    return this.workflowToDefinition.has(LocalWorkflowStub.createKey({ name, version }));
  }

  public async callWorkflowWithInput({ name, version }: Partial<WorkflowDefinition>, input: string) {
    if (this.isWorkflowExists({ name, version })) {
      const definition = this.getDefinition({ name, version });
      const methodProxy = this.getMethodProxyForDefinition(definition);
      const result = await methodProxy(input);
      console.log('callWorkflowWithInput Finished:', result);
      return result;
    }
    throw new WorkflowDoesNotExistsException(LocalWorkflowStub.createKey({ name, version }));
  }

  private storeDefinition(definition: WorkflowDefinition) {
    this.workflowToDefinition.set(LocalWorkflowStub.createKey(definition), definition);
  }

  private static createKey({ name, version }: Partial<WorkflowDefinition>): string {
    return `${name}${version}`;
  }

  private getDefinition({ name, version }: Partial<WorkflowDefinition>): WorkflowDefinition {
    return this.workflowToDefinition.get(LocalWorkflowStub.createKey({ name, version }));
  }

  private getMethodProxyForDefinition(definition: WorkflowDefinition): (input: string) => any {
    const methodName = definition.decoratedMethodName;
    const instance: any = this.instance;
    const method: Function = instance[methodName] as Function;
    const serializer = definition.serializer;
    return (input: string) => {
      const params = serializer.parse(input);
      return method.apply(instance, params);
    };
  }
}
