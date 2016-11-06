import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";
import {ActivityDefinition} from "../../decorators/activity/activity-definition";
import {getActivityDefinitionsFromClass} from "../../decorators/activity/activity-decorator-utils";
export class ActivityClientFacade<T> {
    constructor(private activityImplementation: T,
                private contextResolutionStrategy: ContextResolutionStrategy) {
    }

    public getContext(): DecisionRunContext {
        return this.contextResolutionStrategy.getContext();
    }


    public getImplementation(): T {
        return this.activityImplementation;
    }

    private buildHandlers(): void {
        const definitions: ActivityDefinition[] =
            getActivityDefinitionsFromClass(this.getImplementation());


    }
}
