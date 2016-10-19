import {AWSAdapter, GenericAWSAdapter} from "./aws-adapter";
import {KernelModule, interfaces} from "inversify";
import {AWS_ADAPTER, SWF_RX} from "./types";
import {SwfRx, GenericSwfRx} from "./swf-rx";

export const AwsModule = new KernelModule((bind: interfaces.Bind) => {
    bind<AWSAdapter>(AWS_ADAPTER).to(GenericAWSAdapter);
    bind<SwfRx>(SWF_RX).to(GenericSwfRx);
});
