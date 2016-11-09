import {Kernel, injectable, inject} from "inversify";
import {tagged} from "inversify";
import {APP_KERNEL} from "../../../symbols";


export const ACTOR_TAG = 'actor';
export const ACTOR_CLIENT_TAG = 'actor-client';

export const actor = tagged(ACTOR_TAG, true);
export const actorClient = tagged(ACTOR_CLIENT_TAG, false);


export type ActorImplementation = {
    impl: any,
    binding: symbol
};

export interface ActorClientImplementationHelper {

}

export class ActivityClient<T> {
    constructor(private implementation: T) {
    }

    getImplementation(): T {
        return this.implementation;
    }

    private getContext() {

    }
}


@injectable()
export class BaseActorClientImplementationHelper implements ActorClientImplementationHelper {
    constructor(@inject(APP_KERNEL) private appKernel: Kernel) {
    }

    addImplementations(implementationList: ActorImplementation[]) {
        implementationList.forEach((activityImp)=> {
            const impl = activityImp.impl;
            this.appKernel.bind(activityImp.binding).to(activityImp.impl)
                .whenTargetTagged(ACTOR_TAG, true);
            this.appKernel.bind(activityImp.binding).toDynamicValue(()=> {
                return new ActivityClient(impl);
            }).whenTargetTagged(ACTOR_CLIENT_TAG, true);
        });
    }
}