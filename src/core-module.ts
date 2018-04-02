import 'zone.js';
import { ContainerModule, interfaces } from 'inversify';
import { AWSClientProvider, DefaultAWSClientProvider } from './aws/aws-client-provider';
import {
  AWS_ADAPTER, WORKFLOW_CLIENT, ACTIVITY_POLLER_FACTORY, DECISION_POLLER_FACTORY,
  REMOTE_ACTOR_PROXY_FACTORY, DECISION_CONTEXT_RESOLUTION,
  REMOTE_ACTIVITY_ADAPTER_FACTORY, CONTEXT_CACHE,
} from './symbols';
import { WorkflowClient, BaseWorkflowClient } from './aws/workflow-client';
import { ActivityPollerFactory, GenericActivityPollerFactory } from './aws/swf/activity-poller-factory';
import { DecisionPollerFactory, GenericDecisionPollerFactory } from './aws/swf/decision-poller-factory';
import { ActorProxyFactory, RemoteActorProxyFactory } from './core/actor/proxy/actor-proxy-factory';
import { ContextResolutionStrategy } from './core/context/resolution-strategies/resolution-stategy';
import { DecisionRunContext } from './core/context/decision-run-context';
import { ZoneContextResolutionStrategy } from './core/context/resolution-strategies/zone-resolution-strategy';
import { DECISION_RUN_CONTEXT_ZONE_KEY } from './constants';
import {
  RemoteActivityAdapterFactory,
  DefaultRemoteActivityAdapterFactory,
} from './core/actor/activity/adapters/remote-activity-adapter';
import { IMPLEMENTATION_HELPER, ImplementationHelper } from './core/generics/implementation-helper';
import {
  BaseRemoteWorkflowClientFactory, WORKFLOW_REMOTE_CLIENT_FACTORY,
  WorkflowClientFactory,
} from './core/workflow/workflow-client-factory';
import { BaseWorkflows, Workflows, WORKFLOWS } from './core/workflow/workflows';
import { BaseUuidGenerator, UUID_GENERATOR, UuidGenerator } from './core/utils/uuid-generator';
import {
  BaseWorkflowWorkerFactory, WORKFLOW_WORKER_FACTORY,
  WorkflowWorkerFactory,
} from './core/workflow/worker/workflow-worker-factory';
import { BaseContextCache, ContextCache } from './core/context/context-cache';
import { ACTOR_WORKER_FACTORY, ActorWorkerFactory, BaseActorWorkerFactory } from './core/actor/worker/actor-worker-factory';
import { LOGGER, Logger } from './core/logging/logger';
import { DefaultLogger } from './core/logging/default-logger';
import { BaseImplementationHelper } from './core/application/helpers/base-implementation-helper';

export const CORE: ContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<AWSClientProvider>(AWS_ADAPTER)
    .to(DefaultAWSClientProvider).inSingletonScope();
  bind<WorkflowClient>(WORKFLOW_CLIENT)
    .to(BaseWorkflowClient).inSingletonScope();
  bind<ActivityPollerFactory>(ACTIVITY_POLLER_FACTORY)
    .to(GenericActivityPollerFactory).inSingletonScope();
  bind<DecisionPollerFactory>(DECISION_POLLER_FACTORY)
    .to(GenericDecisionPollerFactory).inSingletonScope();
  bind<ImplementationHelper>(IMPLEMENTATION_HELPER)
    .to(BaseImplementationHelper).inSingletonScope();
  bind<WorkflowClientFactory>(WORKFLOW_REMOTE_CLIENT_FACTORY)
    .to(BaseRemoteWorkflowClientFactory).inSingletonScope();
  bind<ActorProxyFactory>(REMOTE_ACTOR_PROXY_FACTORY)
    .to(RemoteActorProxyFactory).inSingletonScope();
  bind<Workflows>(WORKFLOWS)
    .to(BaseWorkflows).inSingletonScope();
  bind<UuidGenerator>(UUID_GENERATOR)
    .to(BaseUuidGenerator).inSingletonScope();
  bind<WorkflowWorkerFactory>(WORKFLOW_WORKER_FACTORY)
    .to(BaseWorkflowWorkerFactory)
    .inSingletonScope();
  bind<ContextCache>(CONTEXT_CACHE).to(BaseContextCache)
    .inSingletonScope();
  bind<ContextResolutionStrategy<DecisionRunContext>>(DECISION_CONTEXT_RESOLUTION)
    .toConstantValue(new ZoneContextResolutionStrategy<DecisionRunContext>(DECISION_RUN_CONTEXT_ZONE_KEY));
  bind<RemoteActivityAdapterFactory>(REMOTE_ACTIVITY_ADAPTER_FACTORY)
    .to(DefaultRemoteActivityAdapterFactory).inSingletonScope();
  bind<ActorWorkerFactory>(ACTOR_WORKER_FACTORY)
    .to(BaseActorWorkerFactory).inSingletonScope();
  bind<Logger>(LOGGER).to(DefaultLogger).inRequestScope();

});
