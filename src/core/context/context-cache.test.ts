import 'reflect-metadata';
import { BaseContextCache } from './context-cache';
import { expect } from 'chai';
import { BaseDecisionRunContext } from './decision-run-context';
import { TestLogger } from '../../testing/mocks/test-logger';

describe('BaseContextCache', () => {
  describe('getOrCreateContext', () => {
    it('should create new context if context is not exists', () => {
      const contextCache = new BaseContextCache(new TestLogger());
      const context = contextCache.getOrCreateContext('runidteest');
      expect(context).to.be.instanceOf(BaseDecisionRunContext);
    });
    it('should not create context if context is exists', () => {
      const contextCache = new BaseContextCache(new TestLogger());
      const context = contextCache.getOrCreateContext('runidteest');
      const context2 = contextCache.getOrCreateContext('runidteest');
      expect(context).to.eq(context2);
    });
  });
});
