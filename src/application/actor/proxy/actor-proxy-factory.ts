import {Class} from "../../../implementation";
import {injectable, inject} from "inversify";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {DECISION_CONTEXT_RESOLUTION, REMOTE_ACTIVITY_ADAPTER_FACTORY} from "../../../symbols";
import {
    RemoteActivityAdapterFactory,
    DefaultRemoteActivityAdapter
} from "../../activity/adapters/remote-activity-adapter";
import {ActivityDefinition} from "../../activity/activity-definition";
import {getActivityDefinitionsFromClass} from "../../activity/decorators/activity-decorator-utils";


export interface ActorProxyFactory {
    create<T>(implementation: Class<T>, taskList: string): T;
}


export class ActorProxy {

}

@injectable()
export class RemoteActorProxyFactory implements ActorProxyFactory {
    constructor(@inject(DECISION_CONTEXT_RESOLUTION)
                private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
                @inject(REMOTE_ACTIVITY_ADAPTER_FACTORY)
                private remoteActivityAdapterFactory: RemoteActivityAdapterFactory) {
    }

    create<T>(implementation: Class<T>, taskList: string): T {
        const activityDefinitions: ActivityDefinition[] = getActivityDefinitionsFromClass(implementation);
        const actorProxy: any = new ActorProxy();
        const caller = function (): any {
            return this.createObservable(Array.from(arguments));
        };
        activityDefinitions.forEach((definition: ActivityDefinition)=> {
            const adapter: DefaultRemoteActivityAdapter = this.remoteActivityAdapterFactory
                .create(this.contextResolutionStrategy, definition, taskList);
            actorProxy[definition._decoratedMethodName] = caller.bind(adapter);
        });
        return actorProxy;
    }
}

