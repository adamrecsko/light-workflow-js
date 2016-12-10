import {Newable} from "../../../implementation";
import {injectable, inject} from "inversify";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {DECISION_CONTEXT_RESOLUTION, REMOTE_ACTIVITY_ADAPTER_FACTORY} from "../../../symbols";
import {
    RemoteActivityAdapterFactory,
    RemoteActivityAdapter
} from "../../activity/adapters/remote-activity-adapter";
import {ActivityDefinition} from "../../activity/activity-definition";
import {getDefinitionsFromClass} from "../../decorators/utils";


export interface ActorProxyFactory {
    create<T>(implementation: Newable<T>, taskList: string): T;
}

export class ActorProxy {
}


const caller = function (): any {
    return this.createObservable(Array.from(arguments));
};


@injectable()
export class RemoteActorProxyFactory implements ActorProxyFactory {

    constructor(@inject(DECISION_CONTEXT_RESOLUTION)
                private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
                @inject(REMOTE_ACTIVITY_ADAPTER_FACTORY)
                private remoteActivityAdapterFactory: RemoteActivityAdapterFactory) {
    }

    create<T>(implementation: Newable<T>, taskList: string): T {
        const activityDefinitions: ActivityDefinition[] = getDefinitionsFromClass<ActivityDefinition>(implementation);
        const actorProxy: any = new ActorProxy();
        activityDefinitions.forEach((definition: ActivityDefinition) => {
            const adapter: RemoteActivityAdapter = this.remoteActivityAdapterFactory
                .create(this.contextResolutionStrategy, definition, taskList);
            actorProxy[definition.decoratedMethodName] = caller.bind(adapter);
        });
        return actorProxy;
    }
}
