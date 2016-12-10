import {DecisionRunContext, BaseDecisionRunContext} from "../context/decision-run-context";
import {injectable} from "inversify";
export interface ContextCache {
    getOrCreateContext(runId: string): DecisionRunContext;
}


@injectable()
export class BaseContextCache implements ContextCache {
    private runIdToRunContext: Map<string,DecisionRunContext>;

    constructor() {
        this.runIdToRunContext = new Map();
    }

    getOrCreateContext(runId: string): DecisionRunContext {
        let result: DecisionRunContext;
        if (this.runIdToRunContext.has(runId)) {
            result = this.runIdToRunContext.get(runId);
        } else {
            result = new BaseDecisionRunContext();
            this.runIdToRunContext.set(runId, result);
        }
        return result;
    }
}