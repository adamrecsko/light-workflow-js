import { AbstractDecoratorDefinition } from '../decorators/abstract-decorator-definition';
import { TaskList } from '../../aws/aws.types';

export class WorkflowDefinition extends AbstractDecoratorDefinition {
  childPolicy: string;
  executionStartToCloseTimeout: string;
  lambdaRole: string;
  tagList: string[];
  taskPriority: string;
  taskStartToCloseTimeout: string;
  defaultChildPolicy: string;
  defaultExecutionStartToCloseTimeout: string;
  defaultLambdaRole: string;
  defaultTaskList: TaskList;
  defaultTaskPriority: string;
  defaultTaskStartToCloseTimeout: string;
}

export enum WorkflowDefinitionProperties {
    name = 1,
    version,
    description,
    taskPriority,
    defaultTaskPriority,
    serializer,
    childPolicy,
    executionStartToCloseTimeout,
    lambdaRole,
    tagList,
    taskStartToCloseTimeout,
    defaultChildPolicy,
    defaultExecutionStartToCloseTimeout,
    defaultLambdaRole,
    defaultTaskList,
    defaultTaskStartToCloseTimeout,
}
