import "zone.js";
import {ContextResolutionStrategy} from "./resolution-stategy";
import {DecisionRunContext} from "../decision-run-context";


export class ContextNotFoundException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class ZoneContextResolutionStrategy implements ContextResolutionStrategy {
    constructor(private contextKey: string) {
    }

    public getContext(): DecisionRunContext {
        const context: DecisionRunContext = Zone.current.get(this.contextKey);
        if (!context) {
            throw new ContextNotFoundException(`Context with key: ${this.contextKey} not found in current zone: ${ Zone.current.name}`)
        }
        return context;
    }
}
