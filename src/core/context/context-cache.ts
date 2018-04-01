import { DecisionRunContext, BaseDecisionRunContext } from './decision-run-context';
import { inject, injectable } from 'inversify';
import { LOGGER, Logger } from '../logging/logger';

export interface ContextCache {
  getOrCreateContext(runId: string): DecisionRunContext;
}


@injectable()
export class BaseContextCache implements ContextCache {
  private runIdToRunContext: Map<string, DecisionRunContext>;

  constructor(@inject(LOGGER) private logger: Logger) {
    this.runIdToRunContext = new Map();
  }

  getOrCreateContext(runId: string): DecisionRunContext {
    let result: DecisionRunContext;
    if (this.runIdToRunContext.has(runId)) {
      result = this.runIdToRunContext.get(runId);
    } else {
      result = new BaseDecisionRunContext(this.logger);
      this.runIdToRunContext.set(runId, result);
    }
    return result;
  }
}
