import {injectable, inject} from 'inversify';
import {SWF} from "aws-sdk";
import {ApplicationConfigurationProvider} from "../core/application/application-configuration-provider";
import {APPLICATION_CONFIGURATION} from "../symbols";

export interface AWSClientProvider {
  getNativeSWFClient(): SWF
}

@injectable()
export class DefaultAWSClientProvider implements AWSClientProvider {
  constructor(@inject(APPLICATION_CONFIGURATION) private configProvider: ApplicationConfigurationProvider) {
  }
  getNativeSWFClient(): SWF {
    const {swf} = this.configProvider.getConfiguration();
    return swf;
  }
}
