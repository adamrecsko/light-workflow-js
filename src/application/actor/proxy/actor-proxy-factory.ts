import {Class} from "../../../implementation";
import {injectable, inject} from "inversify";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {DECISION_CONTEX_RESOLUTION, REMOTE_ACTIVITY_ADAPTER_FACTORY} from "../../../symbols";
import {RemoteActivityAdapterFactory, DefaultRemoteActivityAdapter} from "../../activity/adapters/remote-activity-adapter";
import {ActivityDefinition} from "../../activity/activity-definition";
import {getActivityDefinitionsFromClass} from "../../activity/decorators/activity-decorator-utils";


export interface ActorProxyFactory {
    create(implementation: Class<any>, taskList: string): any
}

@injectable()
export class RemoteActorProxyFactory implements ActorProxyFactory {
    constructor(@inject(DECISION_CONTEX_RESOLUTION)
                private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
                @inject(REMOTE_ACTIVITY_ADAPTER_FACTORY)
                private remoteActivityAdapterFactory: RemoteActivityAdapterFactory) {
    }

    create<T>(implementation: Class<T>, taskList: string): T {
        const activityDefinitions: ActivityDefinition[] = getActivityDefinitionsFromClass(implementation);
        const actorProxy: any = {};
        activityDefinitions.forEach((definition: ActivityDefinition)=> {
            const adapter: DefaultRemoteActivityAdapter = this.remoteActivityAdapterFactory
                .create(this.contextResolutionStrategy, definition, taskList);
            actorProxy[definition._decoratedMethodName] = adapter.createObservable.bind(adapter);
        });
        return actorProxy;
    }
}

