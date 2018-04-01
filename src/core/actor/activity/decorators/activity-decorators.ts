import { activityDefinitionDecoratorFactory as decoratorFactory } from './activity-decorator-factory';
import { Serializer } from '../../../application/serializer';
import { TaskList } from '../../../../aws/aws.types';

// definition property setters
export const activity = decoratorFactory<string>('name');
export const name = decoratorFactory<string>('name');
export const version = decoratorFactory<string>('version');
export const defaultTaskHeartbeatTimeout = decoratorFactory<string>('defaultTaskHeartbeatTimeout');
export const defaultTaskList = decoratorFactory<TaskList>('defaultTaskList');
export const defaultTaskPriority = decoratorFactory<string>('defaultTaskPriority');
export const defaultTaskScheduleToCloseTimeout = decoratorFactory<string>('defaultTaskScheduleToCloseTimeout');
export const defaultTaskScheduleToStartTimeout = decoratorFactory<string>('defaultTaskScheduleToStartTimeout');
export const defaultTaskStartToCloseTimeout = decoratorFactory<string>('defaultTaskStartToCloseTimeout');
export const description = decoratorFactory<string>('description');
export const heartbeatTimeout = decoratorFactory<string>('heartbeatTimeout');
export const scheduleToCloseTimeout = decoratorFactory<string>('scheduleToCloseTimeout');
export const scheduleToStartTimeout = decoratorFactory<string>('scheduleToStartTimeout');
export const startToCloseTimeout = decoratorFactory<string>('startToCloseTimeout');
export const taskPriority = decoratorFactory<string>('taskPriority');
export const serializer = decoratorFactory<Serializer>('serializer');
