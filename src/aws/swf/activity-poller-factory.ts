import {Observable} from "rxjs/Rx";
import {AWSAdapter} from "../aws-adapter";
import {injectable, inject} from "inversify/dts/inversify";
import {AWS_ADAPTER} from "../types";
import {ActivityTask, ActivityDefinition, ActivityPollParameters} from "../aws.types";

export type ActivityTaskPollerObservable = Observable<ActivityTask>;


export interface ActivityPollerFactory {
    createPoller(definition:ActivityDefinition):ActivityTaskPollerObservable
}


@injectable()
export class GenericActivityPollerFactory implements ActivityPollerFactory {
    constructor(@inject(AWS_ADAPTER) private awsAdapter:AWSAdapter) {
    }


    private createPollParametersFromDefinition(definition:ActivityDefinition){
        const params = new ActivityPollParameters();
        
        params.domain = definition.domain;
        params.identity
        
    }
    
    createPoller(definition:ActivityDefinition):ActivityTaskPollerObservable {
        const pollingObservable =
            this.awsAdapter
                .getSWFRx()
                .pollForActivityTask(new ActivityPollParameters());
        return pollingObservable.repeat();
    }
}