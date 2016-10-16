import {AWSAdapter, GenericAWSAdapter} from "./aws-adapter";
import {KernelModule, interfaces} from "inversify";
import {AWS_ADAPTER} from "./types";

export const AWS_MODULE = new KernelModule((bind: interfaces.Bind) => {
    bind<AWSAdapter>(AWS_ADAPTER).to(GenericAWSAdapter);
});
