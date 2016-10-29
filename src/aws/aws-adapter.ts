import {injectable, inject} from 'inversify';
import {SWF} from "aws-sdk";
import {ApplicationConfigurationProvider} from "../application/application-configuration-provider";
import {APPLICATION_CONFIGURATION} from "../symbols";

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