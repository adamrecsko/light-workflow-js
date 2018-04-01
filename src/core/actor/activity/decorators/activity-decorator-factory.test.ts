import { expect } from 'chai';
import {
  activityDefinitionDecoratorFactory,
} from './activity-decorator-factory';


describe('definitionDecoratorPropertySetterFactory', () => {
  it('should return a function', () => {
    const decorator = activityDefinitionDecoratorFactory('defaultTaskPriority');
    expect(decorator).to.be.a('Function');
  });

  describe('decoratorFactory', () => {
    it('should return a function', () => {
      const decoratorFactory = activityDefinitionDecoratorFactory<string>('defaultTaskPriority');
      const decorator = decoratorFactory('value');
      expect(decorator).to.be.a('Function');
    });

  });
});
