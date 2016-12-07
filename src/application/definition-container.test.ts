import {DefinitionContainer} from "./definition-container";
import {ActivityDefinition} from "./activity/activity-definition";
import {expect} from "chai";
describe('DefinitionContainer', ()=> {
    it('should store given activity definition', ()=> {
        const container = new DefinitionContainer();
        const name = 'testActivity';
        const def = new ActivityDefinition(name);
        container.addDefinition(def);
        expect(container.getDefinitionToProperty(name)).to.eq(def);
    });
});