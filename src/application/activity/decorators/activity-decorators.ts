import {activityDefinitionPropertySetterDecoratorFactory} from "./activity-decorator-utils";
import {ActivityDefinitionProperty} from "../activity-deinition-property";
import {Serializer} from "../serializer";
import {Implementation} from "../../../implementation";


//decorators
export const version = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.version);
export const defaultTaskHeartbeatTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskHeartbeatTimeout);
export const defaultTaskPriority = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskPriority);
export const defaultTaskScheduleToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskScheduleToCloseTimeout);
export const defaultTaskScheduleToStartTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskScheduleToStartTimeout);
export const defaultTaskStartToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.defaultTaskStartToCloseTimeout);
export const description = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.description);
export const heartbeatTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.heartbeatTimeout);
export const scheduleToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.scheduleToCloseTimeout);
export const scheduleToStartTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.scheduleToStartTimeout);
export const startToCloseTimeout = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.startToCloseTimeout);
export const taskPriority = activityDefinitionPropertySetterDecoratorFactory<string>(ActivityDefinitionProperty.taskPriority);
export const serializer = activityDefinitionPropertySetterDecoratorFactory<Implementation<Serializer>>(ActivityDefinitionProperty.serializer);


