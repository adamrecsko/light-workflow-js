import { activityDefinitionDecoratorFactory as decoratorFactory } from './activity-decorator-factory';
import { Serializer } from '../../../application/serializer';
import { ActivityDefinitionProperty } from '../activity-definition';
import { TaskList } from '../../../../aws/aws.types';

// definition property setters
export const activity = decoratorFactory<string>(ActivityDefinitionProperty.name);
export const name = decoratorFactory<string>(ActivityDefinitionProperty.name);
export const version = decoratorFactory<string>(ActivityDefinitionProperty.version);
export const defaultTaskHeartbeatTimeout = decoratorFactory<string>(ActivityDefinitionProperty.defaultTaskHeartbeatTimeout);
export const defaultTaskList = decoratorFactory<TaskList>(ActivityDefinitionProperty.defaultTaskList);
export const defaultTaskPriority = decoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
export const defaultTaskScheduleToCloseTimeout = decoratorFactory<string>(ActivityDefinitionProperty.defaultTaskScheduleToCloseTimeout);
export const defaultTaskScheduleToStartTimeout = decoratorFactory<string>(ActivityDefinitionProperty.defaultTaskScheduleToStartTimeout);
export const defaultTaskStartToCloseTimeout = decoratorFactory<string>(ActivityDefinitionProperty.defaultTaskStartToCloseTimeout);
export const description = decoratorFactory<string>(ActivityDefinitionProperty.description);
export const heartbeatTimeout = decoratorFactory<string>(ActivityDefinitionProperty.heartbeatTimeout);
export const scheduleToCloseTimeout = decoratorFactory<string>(ActivityDefinitionProperty.scheduleToCloseTimeout);
export const scheduleToStartTimeout = decoratorFactory<string>(ActivityDefinitionProperty.scheduleToStartTimeout);
export const startToCloseTimeout = decoratorFactory<string>(ActivityDefinitionProperty.startToCloseTimeout);
export const taskPriority = decoratorFactory<string>(ActivityDefinitionProperty.taskPriority);
export const serializer = decoratorFactory<Serializer>(ActivityDefinitionProperty.serializer);
