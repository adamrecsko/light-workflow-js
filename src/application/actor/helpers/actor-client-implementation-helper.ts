import {Kernel, injectable, inject} from "inversify";
import {tagged} from "inversify";
import {APP_KERNEL, REMOTE_ACTOR_PROXY_FACTORY} from "../../../symbols";
import {RemoteActorProxyFactory, ActorProxyFactory} from "../proxy/actor-proxy-factory";
import {Class} from "../../../implementation";


export const ACTOR_TAG = 'actor';
export const ACTOR_CLIENT_TAG = 'actor-client';

export const actor = tagged(ACTOR_TAG, true);
export const actorClient = tagged(ACTOR_CLIENT_TAG, false);


export type ActorImplementation = {
    impl: Class<any>,
    binding: symbol
};

export interface ActorClientImplementationHelper {

}


@injectable()
export class BaseActorClientImplementationHelper implements ActorClientImplementationHelper {
    constructor(@inject(APP_KERNEL)
                private appKernel: Kernel,
                @inject(REMOTE_ACTOR_PROXY_FACTORY)
                private proxyFactory: ActorProxyFactory) {
    }

    addImplementations(implementationList: ActorImplementation[]) {
        implementationList.forEach((activityImp)=> {
            const impl = activityImp.impl;
            this.appKernel.bind(activityImp.binding).to(activityImp.impl)
                .whenTargetTagged(ACTOR_TAG, true);
            this.appKernel.bind(activityImp.binding).toDynamicValue(()=> {
                return this.proxyFactory.create(impl, 'default');
            }).whenTargetTagged(ACTOR_CLIENT_TAG, true);
        });
    }
}