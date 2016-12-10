import {WorkflowDefinitionProperties, WorkflowDefinition} from "../workflow-definition";
import {ValueSetterDecoratorFactory, definitionPropertySetterFactory} from "../../decorators/utils";
export function workflowDecoratorFactory<T>(workflowDefinitionProperty: WorkflowDefinitionProperties): ValueSetterDecoratorFactory<T> {
    return definitionPropertySetterFactory<T, WorkflowDefinition>(WorkflowDefinitionProperties[workflowDefinitionProperty], WorkflowDefinition);
}