import { AbstractDecoratorDefinition } from '../../utils/decorators/abstract-decorator-definition';
import { TaskList } from '../../../aws/aws.types';

export class ActivityDefinition extends AbstractDecoratorDefinition {
  defaultTaskList: TaskList = { name: 'default' };
  defaultTaskHeartbeatTimeout: string = '10';
  defaultTaskScheduleToCloseTimeout: string = '30';
  defaultTaskScheduleToStartTimeout: string = '5';
  defaultTaskStartToCloseTimeout: string = '20';
  defaultTaskPriority: string = '0';
  heartbeatTimeout: string;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  startToCloseTimeout: string;
}
