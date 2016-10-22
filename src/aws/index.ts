import {AWSAdapter, GenericAWSAdapter} from "./aws-adapter";
import {KernelModule, interfaces} from "inversify";
import {AWS_ADAPTER, WORKFLOW_CLIENT} from "./symbols";
import {WorkflowClient, GenericWorkflowClient} from "./workflow-client";

export const AwsModule = new KernelModule((bind: interfaces.Bind) => {
    bind<AWSAdapter>(AWS_ADAPTER).to(GenericAWSAdapter);
    bind<WorkflowClient>(WORKFLOW_CLIENT).to(GenericWorkflowClient);
});
