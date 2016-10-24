import {KernelModule, interfaces} from "inversify";
import Bind = interfaces.Bind;
import {AWSAdapter, GenericAWSAdapter} from "../aws/aws-adapter";
import {AWS_ADAPTER, WORKFLOW_CLIENT} from "../aws/symbols";
import {WorkflowClient, GenericWorkflowClient} from "../aws/workflow-client";
import {ActivityPollerFactory, GenericActivityPollerFactory} from "../aws/swf/activity-poller-factory";
import {DecisionPollerFactory, GenericDecisionPollerFactory} from "../aws/swf/decision-poller-factory";
import {
    ActivityClientImplementationHelper,
    BaseActivityClientImplementationHelper
} from "../application/activity-client-implementation-helper";


export const ACTIVITY_POLLER_FACTORY = Symbol('ACTIVITY_POLLER_FACTORY');
export const DECISION_POLLER_FACTORY = Symbol('DECISION_POLLER_FACTORY');
export const ACTIVITY_CLIENT_IMPLEMENTATION_HELPER = Symbol('ACTIVITY_CLIENT_IMPLEMENTATION_HELPER');

export const CORE: KernelModule = new KernelModule((bind: Bind) => {
    bind<AWSAdapter>(AWS_ADAPTER)
        .to(GenericAWSAdapter).inSingletonScope();
    bind<WorkflowClient>(WORKFLOW_CLIENT)
        .to(GenericWorkflowClient).inSingletonScope();
    bind<ActivityPollerFactory>(ACTIVITY_POLLER_FACTORY)
        .to(GenericActivityPollerFactory).inSingletonScope();
    bind<DecisionPollerFactory>(DECISION_POLLER_FACTORY)
        .to(GenericDecisionPollerFactory).inSingletonScope();
    bind<ActivityClientImplementationHelper>(ACTIVITY_CLIENT_IMPLEMENTATION_HELPER)
        .to(BaseActivityClientImplementationHelper).inSingletonScope();
});