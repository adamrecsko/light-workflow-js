import { AbstractDecoratorDefinition } from '../../utils/decorators/abstract-decorator-definition';
import { TaskList } from '../../../aws/aws.types';

export class ActivityDefinition extends AbstractDecoratorDefinition {
  defaultTaskList: TaskList = { name: 'default' };
  defaultTaskHeartbeatTimeout: string = '10';
  defaultTaskScheduleToCloseTimeout: string = '30';
  defaultTaskScheduleToStartTimeout: string = '5';
  defaultTaskStartToCloseTimeout: string = '20';
  defaultTaskPriority: string = 'default';
  heartbeatTimeout: string;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  startToCloseTimeout: string;
}

export enum ActivityDefinitionProperty {
  name = 1,
  version,
  defaultTaskHeartbeatTimeout,
  defaultTaskList,
  defaultTaskPriority,
  defaultTaskScheduleToCloseTimeout,
  defaultTaskScheduleToStartTimeout,
  defaultTaskStartToCloseTimeout,
  description,
  heartbeatTimeout,
  scheduleToCloseTimeout,
  scheduleToStartTimeout,
  startToCloseTimeout,
  taskPriority,
  serializer,
}
