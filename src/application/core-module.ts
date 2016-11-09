import {KernelModule, interfaces} from "inversify";
import Bind = interfaces.Bind;
import {AWSAdapter, GenericAWSAdapter} from "../aws/aws-adapter";
import {
    AWS_ADAPTER, WORKFLOW_CLIENT, ACTIVITY_POLLER_FACTORY, DECISION_POLLER_FACTORY,
    ACTIVITY_CLIENT_IMPLEMENTATION_HELPER
} from "../symbols";
import {WorkflowClient, GenericWorkflowClient} from "../aws/workflow-client";
import {ActivityPollerFactory, GenericActivityPollerFactory} from "../aws/swf/activity-poller-factory";
import {DecisionPollerFactory, GenericDecisionPollerFactory} from "../aws/swf/decision-poller-factory";
import {
    ActorClientImplementationHelper,
    BaseActorClientImplementationHelper
} from "./actor/helpers/actor-client-implementation-helper";



export const CORE: KernelModule = new KernelModule((bind: Bind) => {
    bind<AWSAdapter>(AWS_ADAPTER)
        .to(GenericAWSAdapter).inSingletonScope();
    bind<WorkflowClient>(WORKFLOW_CLIENT)
        .to(GenericWorkflowClient).inSingletonScope();
    bind<ActivityPollerFactory>(ACTIVITY_POLLER_FACTORY)
        .to(GenericActivityPollerFactory).inSingletonScope();
    bind<DecisionPollerFactory>(DECISION_POLLER_FACTORY)
        .to(GenericDecisionPollerFactory).inSingletonScope();
    bind<ActorClientImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER)
        .to(BaseActorClientImplementationHelper).inSingletonScope();
});