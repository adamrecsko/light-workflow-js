import 'zone.js';
import { ZoneContextResolutionStrategy, ContextNotFoundException } from './zone-resolution-strategy';
import { BaseDecisionRunContext } from '../decision-run-context';
import { expect } from 'chai';
import { TestLogger } from '../../../testing/mocks/test-logger';

describe('ZoneContextResolutionStrategy', () => {
  context('if context found', () => {
    it('should gives back run context from current zone', () => {
      const key = 'test-key';
      const contextResolution = new ZoneContextResolutionStrategy(key);
      const runContext = new BaseDecisionRunContext(new TestLogger());
      const props = {
        [key]: runContext,
      };
      Zone.current.fork({
        name: 'test fork',
        properties: props,
      }).run(() => {
        const testCtx = contextResolution.getContext();
        expect(testCtx).to.be.eq(runContext);
      });
    });
  });

  context('if context not found', () => {
    it('should throw ContextNotFoundException', () => {
      const key = 'test-key';
      const contextResolution = new ZoneContextResolutionStrategy(key);
      expect(() => {
        contextResolution.getContext();
      }).to.throw(ContextNotFoundException);
    });
  });

});
