import {ActivityAdapter} from "./actvity-adapter";
import {Observable} from "rxjs";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {ActivityDefinition} from "../activity-definition";
import {ObservableFactory} from "../../observable-factory";
import {DefaultRemoteObservableFactory} from "../observable/remote-activity-observable";
import {Serializer} from "../serializer";
import {injectable} from "inversify";


export interface RemoteActivityAdapter extends ActivityAdapter<any[],string>{
    createObservable(callParams: any[]): Observable<string>;
}

export class DefaultRemoteActivityAdapter implements RemoteActivityAdapter {
    constructor(private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
                private activityDefinition: ActivityDefinition,
                private taskList: string,
                private observableFactory?: ObservableFactory<string>) {
        this.observableFactory = observableFactory || new DefaultRemoteObservableFactory();
    }

    public createObservable(callParams: any[]): Observable<string> {
        const context: DecisionRunContext = this.contextResolutionStrategy.getContext();
        const activityId = context.getNextId();
        const attributes = DefaultRemoteActivityAdapter.createScheduleAttributes(this.activityDefinition, this.taskList, callParams, activityId);
        return this.observableFactory.create(context, attributes);
    }


    private static createScheduleAttributes(activityDefinition: ActivityDefinition, taskList: string, callParams: any[], activityId: string): ScheduleActivityTaskDecisionAttributes {
        const serializer: Serializer = activityDefinition.serializer;
        const input = serializer.stringify(callParams);
        const attributes: ScheduleActivityTaskDecisionAttributes = {
            activityType: {
                name: activityDefinition.name,
                version: activityDefinition.version
            },
            activityId: activityId,
            input: input,
            scheduleToCloseTimeout: activityDefinition.scheduleToCloseTimeout,
            taskList: {
                name: taskList
            },
            scheduleToStartTimeout: activityDefinition.scheduleToStartTimeout,
            startToCloseTimeout: activityDefinition.startToCloseTimeout,
            heartbeatTimeout: activityDefinition.heartbeatTimeout
        };
        return attributes;
    }

}


export interface RemoteActivityAdapterFactory {
    create(contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
           activityDefinition: ActivityDefinition,
           taskList: string,
           observableFactory?: ObservableFactory<string>): RemoteActivityAdapter;
}

@injectable()
export class DefaultRemoteActivityAdapterFactory implements RemoteActivityAdapterFactory {
    create(contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>, activityDefinition: ActivityDefinition, taskList: string, observableFactory?: ObservableFactory<string>): DefaultRemoteActivityAdapter {
        return new DefaultRemoteActivityAdapter(contextResolutionStrategy, activityDefinition, taskList, observableFactory);
    }
}