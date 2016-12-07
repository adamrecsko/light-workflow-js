import {expect} from "chai";
import {description} from "./activity-decorators";
import {
    getActivityDefinitionsFromClass,
    activityDefinitionDecoratorFactory,
    DefinitionNotAvailableException,
    DEFINITION_SYMBOL,
} from "./activity-decorator-utils";
import {ActivityDefinition} from "../activity-definition";
import {ActivityDefinitionProperty} from "../activity-deinition-property";
import {DefinitionContainer} from "../../definition-container";



describe('getActivityDefinitionsFromClass', ()=> {

    context('if definition exist', ()=> {
        it('should give back an array of activity definitions from the class', ()=> {
            class Clazz {
                @description('TEST')
                testMethodName() {
                }
            }
            const definitions: ActivityDefinition[] = getActivityDefinitionsFromClass(Clazz);
            expect(definitions).to.be.an('array');
        });
    });
    context('if definition not exist', ()=> {
        it('should throw an error', ()=> {
            class Clazz {
                testMethodName() {
                }
            }
            expect(()=> {
                getActivityDefinitionsFromClass(Clazz);
            }).to.throw(DefinitionNotAvailableException);

        });
    });
});

describe('definitionDecoratorPropertySetterFactory', ()=> {
    it('should return a function', ()=> {
        const decorator = activityDefinitionDecoratorFactory(ActivityDefinitionProperty.defaultTaskPriority);
        expect(decorator).to.be.a('Function');
    });

    describe('decoratorFactory', ()=> {
        it('should return a function', ()=> {
            const decoratorFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
            const decorator = decoratorFactory('value');
            expect(decorator).to.be.a('Function');
        });

        describe('decorator', ()=> {
            context('if ActivityDefinitionsContainer exists class already annotated', ()=> {
                it('should not add new ActivityDefinitionsContainer', ()=> {
                    const decoratorFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
                    const decorator = decoratorFactory('value');
                    const testObject: any = {};
                    decorator(testObject, 'testMethod', {});
                    const container = testObject[DEFINITION_SYMBOL];
                    decorator(testObject, 'testMethod2', {});
                    const container2 = testObject[DEFINITION_SYMBOL];
                    expect(container).to.eq(container2);
                });
            });

            context('if ActivityContainer not exists class is not yet annotated', ()=> {
                it('should add ActivityDefinitionsContainer', ()=> {
                    const decoratorFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
                    const decorator = decoratorFactory('value');
                    const testObject: any = {};
                    decorator(testObject, 'testMethod', {});
                    expect(testObject[DEFINITION_SYMBOL]).to.instanceOf(DefinitionContainer);
                });
            });


            context('if ActivityDefinition not exists on property', ()=> {
                it('should add ActivityDefinition to container and use the name of the method as the activity\'s name', ()=> {
                    const decoratorFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
                    const decorator = decoratorFactory('value');
                    const testObject: any = {};
                    const propertyName = 'testMethod';
                    decorator(testObject, propertyName, {});
                    const container = testObject[DEFINITION_SYMBOL];
                    const definition = container.getDefinitionToProperty(propertyName);
                    expect(definition).to.instanceOf(ActivityDefinition);
                    expect(definition.name).to.eq(propertyName);
                });

                it('should add ActivityDefinition to container and set the ', ()=> {
                    const definitionProperty = ActivityDefinitionProperty.defaultTaskPriority;
                    const decoratorFactory = activityDefinitionDecoratorFactory<string>(definitionProperty);
                    const propertyValue = '1234';
                    const decorator = decoratorFactory(propertyValue);
                    const testObject: any = {};
                    const propertyName = 'testMethod';
                    decorator(testObject, propertyName, {});
                    const container = testObject[DEFINITION_SYMBOL];
                    const definition: ActivityDefinition = container.getDefinitionToProperty(propertyName);
                    expect(definition.defaultTaskPriority).to.eq(propertyValue);
                });

            });

            context('if ActivityDefinition exists on property', ()=> {
                it('should not add new ActivityDefinition to container', ()=> {
                    const decoratorFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
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

                it('should set existing ActivityDefinition property', ()=> {
                    const defaultTaskPriorityFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
                    const descriptionFactory = activityDefinitionDecoratorFactory<string>(ActivityDefinitionProperty.description);
                    const taskPriorityValue = '1234';
                    const descriptionValue = 'description';
                    const decorator = defaultTaskPriorityFactory(taskPriorityValue);
                    const decorator2 = descriptionFactory(descriptionValue);
                    const testObject: any = {};
                    const propertyName = 'testMethod';
                    decorator(testObject, propertyName, {});
                    const container = testObject[DEFINITION_SYMBOL];
                    const definition: ActivityDefinition = container.getDefinitionToProperty(propertyName);
                    decorator2(testObject, propertyName, {});
                    expect(definition.description).to.eq(descriptionValue);
                });

            });

        });
    });
});