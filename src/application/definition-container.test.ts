import {DefinitionContainer} from "./definition-container";
import {expect} from "chai";
import {AbstractDecoratorDefinition} from "./abstract-decorator-definition";


describe('DefinitionContainer', () => {
    it('should store given activity definition', () => {

        class MockDecoratorDefinition extends AbstractDecoratorDefinition {
        }
        const container = new DefinitionContainer();
        const name = 'testActivity';
        const def = new MockDecoratorDefinition(name);
        container.addDefinition(def);
        expect(container.getDefinitionToProperty(name)).to.eq(def);
    });
});