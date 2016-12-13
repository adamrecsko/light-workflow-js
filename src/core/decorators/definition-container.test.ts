import {AbstractDefinitionContainer} from "./definition-container";
import {expect} from "chai";
import {AbstractDecoratorDefinition} from "./abstract-decorator-definition";


class TestDecoratorDefinition extends AbstractDecoratorDefinition {
}

class TestDefinitionContainer extends AbstractDefinitionContainer<TestDecoratorDefinition> {
    protected createDefinition(decoratedPropertyName: string): TestDecoratorDefinition {
        return new TestDecoratorDefinition(decoratedPropertyName);
    }
}

describe('AbstractDefinitionContainer', () => {
    it('should store given activity definition', () => {
        const container = new TestDefinitionContainer();
        const name = 'testActivity';
        const def = new TestDecoratorDefinition(name);
        container.addDefinition(def);
        expect(container.getDefinitionToProperty(name)).to.eq(def);
    });


    context('if definition is not exists', () => {
        it('should create new TestDecoratorDefinition', () => {
            const container = new TestDefinitionContainer();
            const propertyName = 'testPropertyName';
            const definition = container.createOrGetDefinitionToDecoratedProperty(propertyName);
            expect(definition).to.exist;
            expect(definition).to.be.instanceof(TestDecoratorDefinition);
        });
    });

    context('if definition exists', () => {
        it('should return stored TestDecoratorDefinition', () => {
            const container = new TestDefinitionContainer();
            const propertyName = 'testPropertyName';
            const definition = container.createOrGetDefinitionToDecoratedProperty(propertyName);
            const definition2 = container.createOrGetDefinitionToDecoratedProperty(propertyName);
            expect(definition).to.exist;
            expect(definition).to.eq(definition2);
        });
    });

});