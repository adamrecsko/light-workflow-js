import { workflowDecoratorFactory as decoratorFactory } from './workflow-decorator-factory';
import { ChildPolicy } from '../workflow-definition';
import { Serializer } from '../../application/serializer';
import { TaskList } from '../../../aws/aws.types';


export const workflow = decoratorFactory<string>('name');

export const name = decoratorFactory<string>('name');

export const version = decoratorFactory<string>('version');

export const description = decoratorFactory<string>('description');

export const taskPriority = decoratorFactory<string>('taskPriority');

export const defaultTaskPriority = decoratorFactory<string>('defaultTaskPriority');

export const serializer = decoratorFactory<Serializer>('serializer');

export const childPolicy = decoratorFactory<ChildPolicy>('childPolicy');

export const executionStartToCloseTimeout = decoratorFactory<string>('executionStartToCloseTimeout');

export const lambdaRole = decoratorFactory<string>('lambdaRole');

export const tagList = decoratorFactory<string[]>('tagList');

export const taskStartToCloseTimeout = decoratorFactory<string>('taskStartToCloseTimeout');

export const defaultChildPolicy = decoratorFactory<ChildPolicy>('defaultChildPolicy');

export const defaultExecutionStartToCloseTimeout = decoratorFactory<string>('defaultExecutionStartToCloseTimeout');

export const defaultLambdaRole = decoratorFactory<string>('defaultLambdaRole');

export const defaultTaskList = decoratorFactory<TaskList>('defaultTaskList');

export const defaultTaskStartToCloseTimeout = decoratorFactory<string>('defaultTaskStartToCloseTimeout');


