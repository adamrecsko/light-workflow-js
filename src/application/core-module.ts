import {ContainerModule, interfaces} from "inversify";
import Bind = interfaces.Bind;
import {AWSClientProvider, DefaultAWSClientProvider} from "../aws/aws-client-provider";
import {
    AWS_ADAPTER, WORKFLOW_CLIENT, ACTIVITY_POLLER_FACTORY, DECISION_POLLER_FACTORY,
    ACTIVITY_CLIENT_IMPLEMENTATION_HELPER, REMOTE_ACTOR_PROXY_FACTORY, DECISION_CONTEXT_RESOLUTION,
    REMOTE_ACTIVITY_ADAPTER_FACTORY
} from "../symbols";
import {WorkflowClient, BaseWorkflowClient} from "../aws/workflow-client";
import {ActivityPollerFactory, GenericActivityPollerFactory} from "../aws/swf/activity-poller-factory";
import {DecisionPollerFactory, GenericDecisionPollerFactory} from "../aws/swf/decision-poller-factory";
import {
    ActorClientImplementationHelper,
    BaseActorClientImplementationHelper
} from "./actor/helpers/actor-client-implementation-helper";
import {ActorProxyFactory, RemoteActorProxyFactory} from "./actor/proxy/actor-proxy-factory";
import {ContextResolutionStrategy} from "./context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "./context/decision-run-context";
import {ZoneContextResolutionStrategy} from "./context/resolution-strategies/zone-resolution-strategy";
import {DECISION_RUN_CONTEXT_ZONE_KEY} from "../constants";
import {
    RemoteActivityAdapterFactory,
    DefaultRemoteActivityAdapterFactory
} from "./activity/adapters/remote-activity-adapter";


export const CORE: ContainerModule = new ContainerModule((bind: Bind) => {
    bind<AWSClientProvider>(AWS_ADAPTER)
        .to(DefaultAWSClientProvider).inSingletonScope();
    bind<WorkflowClient>(WORKFLOW_CLIENT)
        .to(BaseWorkflowClient).inSingletonScope();
    bind<ActivityPollerFactory>(ACTIVITY_POLLER_FACTORY)
        .to(GenericActivityPollerFactory).inSingletonScope();
    bind<DecisionPollerFactory>(DECISION_POLLER_FACTORY)
        .to(GenericDecisionPollerFactory).inSingletonScope();
    bind<ActorClientImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER)
        .to(BaseActorClientImplementationHelper).inSingletonScope();
    bind<ActorProxyFactory>(REMOTE_ACTOR_PROXY_FACTORY)
        .to(RemoteActorProxyFactory).inSingletonScope();
    bind<ContextResolutionStrategy<DecisionRunContext>>(DECISION_CONTEXT_RESOLUTION)
        .toConstantValue(new ZoneContextResolutionStrategy<DecisionRunContext>(DECISION_RUN_CONTEXT_ZONE_KEY));
    bind<RemoteActivityAdapterFactory>(REMOTE_ACTIVITY_ADAPTER_FACTORY)
        .to(DefaultRemoteActivityAdapterFactory).inSingletonScope();
});