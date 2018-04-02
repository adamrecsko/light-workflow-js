import {
  interfaces,
  Container,
  injectable, inject,
} from 'inversify';
import { APP_CONTAINER, REMOTE_ACTOR_PROXY_FACTORY } from '../../../symbols';
import { ActorProxyFactory } from '../../actor/proxy/actor-proxy-factory';
import { Newable } from '../../../implementation';
import { DEFAULT_ACTOR_TASK_LIST } from '../../../constants';
import { ACTOR_CLIENT_TAG, TASK_LIST_TAG } from '../../actor/decorators/actor-decorators';
import { Binding, ImplementationHelper } from '../../generics/implementation-helper';
import Metadata = interfaces.Metadata;
import { WORKFLOW_REMOTE_CLIENT_FACTORY, WorkflowClientFactory } from '../../workflow/workflow-client-factory';
import { WORKFLOW_CLIENT_TAG } from '../../workflow/decorators/workflow-client-decorators';
import { RemoteWorkflowStub } from '../../workflow/workflow-proxy';



@injectable()
export class BaseImplementationHelper implements ImplementationHelper {
  constructor(@inject(APP_CONTAINER)
              private appContainer: Container,
              @inject(REMOTE_ACTOR_PROXY_FACTORY)
              private actorProxyFactory: ActorProxyFactory,
              @inject(WORKFLOW_REMOTE_CLIENT_FACTORY)
              private workflowClientFactory: WorkflowClientFactory) {
  }


  private static getValueFromMetadata(metadatas: Metadata[], key: any): any {
    const meta = metadatas.find(meta => meta.key === key);
    if (meta) {
      return meta.value;
    }
  }

  public addImplementations(implementationList: Binding[]): void {
    implementationList.forEach((binding) => {
      const impl: Newable<any> = binding.impl;


      /*
       Load default actor implementation
       */
      this.appContainer.bind<Newable<any>>(binding.key)
        .to(impl).whenTargetIsDefault();

      /*
        Load actor clients
       */
      this.appContainer.bind<Newable<any>>(binding.key)
        .toDynamicValue((req) => {
          const customTags = req.currentRequest.target.getCustomTags();
          const taskList = BaseImplementationHelper.getValueFromMetadata(customTags, TASK_LIST_TAG);
          return this.actorProxyFactory.create(impl, taskList ? taskList : DEFAULT_ACTOR_TASK_LIST);
        }).whenTargetTagged(ACTOR_CLIENT_TAG, true);

      /*
         Load workflow client definitions
       */
      this.appContainer.bind<RemoteWorkflowStub<any>>(binding.key)
        .toDynamicValue(() => this.workflowClientFactory.create(binding.impl))
        .whenTargetTagged(WORKFLOW_CLIENT_TAG, true);

    });
  }
}
