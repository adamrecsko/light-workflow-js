import {injectable, inject} from 'inversify';
import {SWF} from "aws-sdk";
import {APPLICATION_CONFIGURATION} from "./symbols";
import {ApplicationConfigurationProvider} from "../application/application";

export interface AWSAdapter {
    getNativeSWFClient(): SWF
}

@injectable()
export class GenericAWSAdapter implements AWSAdapter {
    constructor(@inject(APPLICATION_CONFIGURATION) private configProvider: ApplicationConfigurationProvider) {
    }

    getNativeSWFClient(): SWF {
        return this.configProvider.getConfiguration().swf;
    }
}