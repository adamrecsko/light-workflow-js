import {ActivityAdapter} from "./actvity-adapter";
import {Observable} from "rxjs";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {ActivityDefinition} from "../activity-definition";
import {ObservableFactory} from "../../observable-factory";
import {DefaultRemoteObservableFactory} from "../observable/remote-activity-observable";
import {Serializer} from "../serializer";


export class RemoteActivityAdapter<T> implements ActivityAdapter<any[],string> {
    constructor(private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
                private activityDefinition: ActivityDefinition,
                private taskList: string,
                private observableFactory?: ObservableFactory<string>) {
        this.observableFactory = observableFactory || new DefaultRemoteObservableFactory();
    }

    public createObservable(callParams: any[]): Observable<string> {
        const context: DecisionRunContext = this.contextResolutionStrategy.getContext();
        const activityId = context.getNextId();
        const attributes = RemoteActivityAdapter.createScheduleAttributes(this.activityDefinition, this.taskList, callParams, activityId);
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