import {
    tagged, interfaces,
    taggedConstraint, Container,
    injectable, inject
} from "inversify";
import {APP_CONTAINER, REMOTE_ACTOR_PROXY_FACTORY} from "../../../symbols";
import {ActorProxyFactory} from "../proxy/actor-proxy-factory";
import {Newable} from "../../../implementation";
import {DEFAULT_ACTOR_TASK_LIST} from "../../../constants";
import {ACTOR_CLIENT_TAG, TASK_LIST_TAG} from "../decorators/actor-decorators";
import {Binding, ImplementationHelper} from "../../generics/implementation-helper";




@injectable()
export class BaseActorClientImplementationHelper implements ImplementationHelper {
    constructor(@inject(APP_CONTAINER)
                private appContainer: Container,
                @inject(REMOTE_ACTOR_PROXY_FACTORY)
                private actorProxyFactory: ActorProxyFactory) {
    }


    public addImplementations(implementationList: Binding[]): void {
      implementationList.forEach((binding) => {
            const impl: Newable<any> = binding.impl;
            const taskLists = binding.taskLists;

            /*
             Load default actor implementation
             */
            this.appContainer.bind<Newable<any>>(binding.key)
                .to(impl).whenTargetIsDefault();

            /*
             Load actor proxy for default task list
             */
            this.appContainer.bind<Newable<any>>(binding.key)
              .toDynamicValue(() => this.actorProxyFactory.create(impl, DEFAULT_ACTOR_TASK_LIST))
              .when((request: interfaces.Request) => request.target.hasTag(ACTOR_CLIENT_TAG) && !request.target.hasTag(TASK_LIST_TAG));

            /*
             Load actor proxy for custom task lists
             */
            if (taskLists)
              taskLists.forEach((taskList) =>
                    this.appContainer.bind<Newable<any>>(binding.key)
                      .toDynamicValue(() => this.actorProxyFactory.create(impl, taskList))
                      .when((r: interfaces.Request) => r.target.hasTag(ACTOR_CLIENT_TAG) && taggedConstraint(TASK_LIST_TAG)(taskList)(r)));
        });
    }
}