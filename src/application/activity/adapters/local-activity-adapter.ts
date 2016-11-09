import {ActivityAdapter} from "./actvity-adapter";
import {Observable} from "rxjs";
import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";
import {ActivityDefinition} from "../activity-definition";

export class LocalActivityAdapter<T> implements ActivityAdapter<any[],T> {


    constructor(private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
                private activityDefinition: ActivityDefinition) {
    }

    private createScheduleAttributes(callParams: any[]): ScheduleActivityTaskDecisionAttributes {
        return null;
    }

    getObservable(callParams: any[]): Observable<T> {
        return null;
    }
}