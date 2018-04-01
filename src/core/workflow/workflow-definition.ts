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
  taskList: TaskList;
  defaultChildPolicy: ChildPolicy = 'TERMINATE';
  defaultExecutionStartToCloseTimeout: string = '60';
  defaultLambdaRole: string;
  defaultTaskList: TaskList = { name: 'default' };
  defaultTaskPriority: string = '0';
  defaultTaskStartToCloseTimeout: string = '20';
}

