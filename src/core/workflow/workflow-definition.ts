import { AbstractDecoratorDefinition } from '../utils/decorators/abstract-decorator-definition';
import { TaskList } from '../../aws/aws.types';

export type ChildPolicy = 'TERMINATE' | 'REQUEST_CANCEL' | 'ABANDON';

export class WorkflowDefinition extends AbstractDecoratorDefinition {
  childPolicy: ChildPolicy;
  executionStartToCloseTimeout: string;
  lambdaRole: string;
  tagList: string[];
  taskPriority: string;
  taskStartToCloseTimeout: string;
  defaultChildPolicy: ChildPolicy;
  defaultExecutionStartToCloseTimeout: string = '60';
  defaultLambdaRole: string;
  defaultTaskList: TaskList = { name: 'default' };
  defaultTaskPriority: string = 'default';
  defaultTaskStartToCloseTimeout: string = '20';
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
