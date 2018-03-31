import {
  getDefinitionsFromClass, DefinitionNotAvailableException, ValueSetterDecoratorFactory,
  definitionPropertySetterFactory, DEFINITION_SYMBOL,
} from './utils';
import { AbstractDecoratorDefinition } from './abstract-decorator-definition';
import { expect } from 'chai';
import { AbstractDefinitionContainer } from './definition-container';

class TestDefinition extends AbstractDecoratorDefinition {
  public testProperty: string;
  public testProperty2: string;
}


class TestDefinitionContainer extends AbstractDefinitionContainer<TestDefinition> {
  protected createDefinition(decoratedPropertyName: string): TestDefinition {
    return new TestDefinition(decoratedPropertyName);
  }
}


const TEST_PROPERTY = 'testProperty';
const TEST_PROPERTY_2 = 'testProperty2';

describe('definitionDecoratorPropertySetterFactory', () => {
  let decoratorFactory: ValueSetterDecoratorFactory<string>;
  beforeEach(() => {
    decoratorFactory = definitionPropertySetterFactory<string, TestDefinition>(TEST_PROPERTY, TestDefinitionContainer);
  });

  it('should return a function', () => {
    expect(decoratorFactory).to.be.a('Function');
  });

  describe('ValueSetterDecoratorFactory', () => {
    describe('decorator', () => {
      context('if AbstractDefinitionContainer exists class and already annotated', () => {
        it('should not add new AbstractDefinitionContainer', () => {
          const decorator = decoratorFactory('value');
          const testObject: any = {};
          decorator(testObject, 'testMethod', {});
          const container = testObject[DEFINITION_SYMBOL];
          decorator(testObject, 'testMethod2', {});
          const container2 = testObject[DEFINITION_SYMBOL];
          expect(container).to.eq(container2);
        });
      });


      context('if AbstractDefinitionContainer not exists class is not yet annotated', () => {
        it('should add AbstractDefinitionContainer', () => {
          const decorator = decoratorFactory('value');
          const testObject: any = {};
          decorator(testObject, 'testMethod', {});
          expect(testObject[DEFINITION_SYMBOL]).to.instanceOf(AbstractDefinitionContainer);
        });
      });

      context('if AbstractDefinitionContainer not exists on property', () => {
        it('should add Definition instance to AbstractDefinitionContainer', () => {
          const decorator = decoratorFactory('value');
          const testObject: any = {};
          const methodName = 'testMethod';
          decorator(testObject, methodName, {});
          const container = testObject[DEFINITION_SYMBOL];
          const definition = container.getDefinitionToProperty(methodName);
          expect(definition).to.instanceOf(TestDefinition);
          expect(definition.name).to.eq(methodName);
        });

        it('should add DecoratorDefinition to container and set the desired property', () => {
          const propertyValue = '1234';
          const decorator = decoratorFactory(propertyValue);
          const testObject: any = {};
          decorator(testObject, TEST_PROPERTY, {});
          const container = testObject[DEFINITION_SYMBOL];
          const definition: TestDefinition = container.getDefinitionToProperty(TEST_PROPERTY);
          expect(definition.testProperty).to.eq(propertyValue);
        });

      });

      context('if DecoratorDefinition exists on property', () => {
        it('should not add new DecoratorDefinition to container', () => {
          const decorator = decoratorFactory('value');
          const testObject: any = {};
          const propertyName = 'testMethod';
          decorator(testObject, propertyName, {});
          const container = testObject[DEFINITION_SYMBOL];
          const definition = container.getDefinitionToProperty(propertyName);
          decorator(testObject, propertyName, {});
          const definition2 = container.getDefinitionToProperty(propertyName);
          expect(definition).to.eq(definition2);
        });

        it('should set existing DecoratorDefinition property', () => {
          const testPropertyValue = '1234';
          const testProperty2Value = 'ABC';
          const decoratorFactory = definitionPropertySetterFactory<string, TestDefinition>(TEST_PROPERTY, TestDefinitionContainer);
          const decorator2Factory = definitionPropertySetterFactory<string, TestDefinition>(TEST_PROPERTY_2, TestDefinitionContainer);

          const decorator = decoratorFactory(testPropertyValue);
          const decorator2 = decorator2Factory(testProperty2Value);


          const testObject: any = {};
          const propertyName = 'testMethod';
          decorator(testObject, propertyName, {});
          const container = testObject[DEFINITION_SYMBOL];
          const definition: TestDefinition = container.getDefinitionToProperty(propertyName);
          decorator2(testObject, propertyName, {});
          expect(definition.testProperty).to.eq(testPropertyValue);
          expect(definition.testProperty2).to.eq(testProperty2Value);

        });

      });

    });
  });
});


describe('getDefinitionsFromClass', () => {

  context('if definition exist', () => {
    it('should give back an array of activity definitions from the class', () => {
      const decorator = definitionPropertySetterFactory<string, TestDefinition>('name', TestDefinitionContainer);

      class Clazz {
        @decorator('test')
        testMethodName() {
        }
      }

      const definitions: TestDefinition[] = getDefinitionsFromClass<TestDefinition>(Clazz);
      expect(definitions).to.be.an('array');
    });
  });
  context('if definition not exist', () => {
    it('should throw an error', () => {
      class Clazz {
        testMethodName() {
        }
      }

      expect(() => {
        getDefinitionsFromClass(Clazz);
      }).to.throw(DefinitionNotAvailableException);

    });
  });
});

