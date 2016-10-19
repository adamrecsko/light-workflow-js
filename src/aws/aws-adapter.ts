import {injectable, inject} from 'inversify';
import {AWS_SWF_NATIVE_CLIENT} from "./types";
import {SWF} from "aws-sdk";
import {SwfRx} from "./swf-rx";

export interface AWSAdapter {
    getNativeSWFClient():SWF
}

@injectable()
export class GenericAWSAdapter implements AWSAdapter {
    constructor(@inject(AWS_SWF_NATIVE_CLIENT) private swf:SWF) {}
    getNativeSWFClient():SWF {
        return this.swf;
    }
}