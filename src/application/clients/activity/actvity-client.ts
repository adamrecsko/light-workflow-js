import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {ActivityDefinition} from "../../decorators/activity/activity-definition";
import {Observable} from "rxjs";
import {ScheduleActivityTaskDecisionAttributes} from "../../../aws/aws.types";


export interface ActivityClient<T> {
    getActivityObservable(...callParams: any[]): Observable<T>;
}


export class BaseActivityClient<T> implements ActivityClient<T> {

    static serialize(data: any): string {
        return JSON.stringify(data);
    }

    static deserialize(str: string): any {
        return JSON.parse(str);
    }

    constructor(private contextResolutionStrategy: ContextResolutionStrategy,
                private activityDefinition: ActivityDefinition) {
    }

    private createScheduleAttributes(callParams: any[]): ScheduleActivityTaskDecisionAttributes {

        return null;

    }

    getActivityObservable(...callParams: any[]): Observable<T> {
        return null;
    }
}

