import {ContextResolutionStrategy} from "../../context/resolution-strategies/resolution-stategy";
import {DecisionRunContext} from "../../context/decision-run-context";

export class ActorProxy<T> {
    constructor(private actorImplementation: T,
                private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>) {
    }

    public getContext(): DecisionRunContext {
        return this.contextResolutionStrategy.getContext();
    }


    public getImplementation(): T {
        return this.actorImplementation;
    }

}
