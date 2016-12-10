import {expect} from "chai";
import {
    activityDefinitionDecoratorFactory
} from "./activity-decorator-utils";
import {ActivityDefinitionProperty} from "../activity-deinition-property";


describe('definitionDecoratorPropertySetterFactory', () => {
    it('should return a function', () => {
        const decorator = activityDefinitionDecoratorFactory(ActivityDefinitionProperty.defaultTaskPriority);
        expect(decorator).to.be.a('Function');
    });

    describe('decoratorFactory', () => {
        it('should return a function', () => {
            const decoratorFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
            const decorator = decoratorFactory('value');
            expect(decorator).to.be.a('Function');
        });

    });
});