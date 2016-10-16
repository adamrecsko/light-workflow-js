import {injectable, inject} from 'inversify';
import {AWS_SWF_NATIVE_CLIENT} from "./types";
import {SWF} from "aws-sdk";
import {SwfRx} from "./swf-rx";

export interface AWSAdapter {
    getNativeSWFClient():SWF
    getSWFRx():SwfRx
}

@injectable()
export class GenericAWSAdapter implements AWSAdapter {
    private swfRx:SwfRx;

    constructor(@inject(AWS_SWF_NATIVE_CLIENT) private swf:SWF) {
        this.swfRx = new SwfRx(swf);
    }

    getNativeSWFClient():SWF {
        return this.swf;
    }


    getSWFRx():SwfRx {
        return this.swfRx;
    }
}