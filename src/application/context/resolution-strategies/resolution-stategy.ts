import {DecisionRunContext} from "../decision-run-context";
export interface ContextResolutionStrategy {
    getContext(): DecisionRunContext;
}