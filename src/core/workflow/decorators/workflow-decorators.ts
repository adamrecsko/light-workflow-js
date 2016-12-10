import {workflowDecoratorFactory as decoratorFactory} from "./workflow-decorator-factory";
import {WorkflowDefinitionProperties} from "../workflow-definition";
import {Serializer} from "../../application/serializer";


export const name = decoratorFactory<string>(WorkflowDefinitionProperties.name);
export const version = decoratorFactory<string>(WorkflowDefinitionProperties.version);
export const description = decoratorFactory<string>(WorkflowDefinitionProperties.description);
export const taskPriority = decoratorFactory<string>(WorkflowDefinitionProperties.taskPriority);
export const defaultTaskPriority = decoratorFactory<string>(WorkflowDefinitionProperties.defaultTaskPriority);
export const serializer = decoratorFactory<Serializer>(WorkflowDefinitionProperties.serializer);
export const childPolicy = decoratorFactory<string>(WorkflowDefinitionProperties.childPolicy);
export const executionStartToCloseTimeout = decoratorFactory<string>(WorkflowDefinitionProperties.executionStartToCloseTimeout);
export const lambdaRole = decoratorFactory<string>(WorkflowDefinitionProperties.lambdaRole);
export const tagList = decoratorFactory<string[]>(WorkflowDefinitionProperties.tagList);
export const taskStartToCloseTimeout = decoratorFactory<string>(WorkflowDefinitionProperties.taskStartToCloseTimeout);
export const defaultChildPolicy = decoratorFactory<string>(WorkflowDefinitionProperties.defaultChildPolicy);
export const defaultExecutionStartToCloseTimeout = decoratorFactory<string>(WorkflowDefinitionProperties.defaultExecutionStartToCloseTimeout);
export const defaultLambdaRole = decoratorFactory<string>(WorkflowDefinitionProperties.defaultLambdaRole);
export const defaultTaskList = decoratorFactory<string>(WorkflowDefinitionProperties.defaultTaskList);
export const defaultTaskStartToCloseTimeout = decoratorFactory<string>(WorkflowDefinitionProperties.defaultTaskStartToCloseTimeout);

