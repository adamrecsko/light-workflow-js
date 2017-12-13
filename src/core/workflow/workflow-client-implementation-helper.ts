import { Binding, ImplementationHelper } from '../generics/implementation-helper';
import { Container, inject, injectable } from 'inversify';
import { APP_CONTAINER } from '../../symbols';
import { Newable } from '../../implementation';
import { WORKFLOW_CLIENT_TAG } from './decorators/workflow-client-decorators';
import { WORKFLOW_CLIENT_FACTORY, WorkflowClientFactory } from './workflow-client-factory';
import { WorkflowProxy } from './workflow-proxy';

export const WORKFLOW_CLIENT_IMPLEMENTATION_HELPER = Symbol('WORKFLOW_CLIENT_IMPLEMENTATION_HELPER');


@injectable()
export class BaseWorkflowClientImplementationHelper implements ImplementationHelper {

  constructor(@inject(APP_CONTAINER)
              private appContainer: Container,
              @inject(WORKFLOW_CLIENT_FACTORY)
              private workflowClientFactory: WorkflowClientFactory) {
  }

  public addImplementations(implementationList: Binding[]): void {
    implementationList.forEach((binding) => {
      const impl: Newable<any> = binding.impl;
      /*
       Load default workflow implementation
       */
      this.appContainer.bind<Newable<any>>(binding.key)
        .to(impl).whenTargetIsDefault();

      /*
       Load workflow client definitions
       */
      this.appContainer.bind<WorkflowProxy>(binding.key)
        .toDynamicValue(() => this.workflowClientFactory.create(binding.impl))
        .whenTargetTagged(WORKFLOW_CLIENT_TAG, true);
    });
  }
}

