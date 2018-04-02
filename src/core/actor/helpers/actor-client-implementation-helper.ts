import {
  tagged, interfaces,
  taggedConstraint, Container,
  injectable, inject,
} from 'inversify';
import { APP_CONTAINER, REMOTE_ACTOR_PROXY_FACTORY } from '../../../symbols';
import { ActorProxyFactory } from '../proxy/actor-proxy-factory';
import { Newable } from '../../../implementation';
import { DEFAULT_ACTOR_TASK_LIST } from '../../../constants';
import { ACTOR_CLIENT_TAG, TASK_LIST_TAG } from '../decorators/actor-decorators';
import { Binding, ImplementationHelper } from '../../generics/implementation-helper';
import Metadata = interfaces.Metadata;


@injectable()
export class BaseActorClientImplementationHelper implements ImplementationHelper {
  constructor(@inject(APP_CONTAINER)
              private appContainer: Container,
              @inject(REMOTE_ACTOR_PROXY_FACTORY)
              private actorProxyFactory: ActorProxyFactory) {
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
          const taskList = BaseActorClientImplementationHelper.getValueFromMetadata(customTags, TASK_LIST_TAG);
          return this.actorProxyFactory.create(impl, taskList ? taskList : DEFAULT_ACTOR_TASK_LIST);
        }).whenTargetTagged(ACTOR_CLIENT_TAG, true);

    });
  }
}
