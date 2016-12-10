import {expect} from "chai";
import {
    activityDefinitionDecoratorFactory
} from "./activity-decorator-factory";
import {ActivityDefinitionProperty} from "../activity-definition";

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
