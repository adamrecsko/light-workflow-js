import {
    tagged, interfaces,
    taggedConstraint, Container,
    injectable, inject
} from "inversify";
import {APP_CONTAINER, REMOTE_ACTOR_PROXY_FACTORY} from "../../../symbols";
import {ActorProxyFactory} from "../proxy/actor-proxy-factory";
import {Class} from "../../../implementation";
import {DEFAULT_ACTOR_TASK_LIST} from "../../../constants";


export const ACTOR_TAG = 'actor';
export const ACTOR_CLIENT_TAG = 'actor-client';
export const TASK_LIST_TAG = 'task-list-tag';

export const actor = tagged(ACTOR_TAG, true);
export const actorClient = tagged(ACTOR_CLIENT_TAG, true);
export const taskList = tagged.bind(null, TASK_LIST_TAG);


export type Binding = {
    impl: Class<any>,
    key: symbol,
    taskLists: string[]
};

export interface ActorClientImplementationHelper {
    addImplementations(implementationList: Binding[]): void;
}

@injectable()
export class BaseActorClientImplementationHelper implements ActorClientImplementationHelper {


    constructor(@inject(APP_CONTAINER)
                private appContainer: Container,
                @inject(REMOTE_ACTOR_PROXY_FACTORY)
                private proxyFactory: ActorProxyFactory) {
    }

    public addImplementations(implementationList: Binding[]): void {
        implementationList.forEach((binding)=> {
            const impl: Class<any> = binding.impl;
            const taskLists = binding.taskLists;

            /*
             Load default actor implementation
             */
            this.appContainer.bind<Class<any>>(binding.key)
                .to(impl).whenTargetIsDefault();

            /*
             Load actor proxy for default task list
             */
            this.appContainer.bind<Class<any>>(binding.key)
                .toDynamicValue(()=>this.proxyFactory.create(impl, DEFAULT_ACTOR_TASK_LIST))
                .when((r: interfaces.Request)=>r.target.hasTag(ACTOR_CLIENT_TAG) && !r.target.hasTag(TASK_LIST_TAG));

            /*
             Load actor proxy for custom task lists
             */
            if (taskLists)
                taskLists.forEach((taskList)=>
                    this.appContainer.bind<Class<any>>(binding.key)
                        .toDynamicValue(()=>this.proxyFactory.create(impl, taskList))
                        .when((r: interfaces.Request)=>r.target.hasTag(ACTOR_CLIENT_TAG) && taggedConstraint(TASK_LIST_TAG)(taskList)(r)));
        });
    }
}