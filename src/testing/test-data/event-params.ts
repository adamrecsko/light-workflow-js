export const SCHEDULED_PARAMS = {
  activityType: 'test activity type',
  activityId: 'test activity id',
  input: 'test input',
  control: 'test control',
  scheduleToStartTimeout: 'scheduleToStartTimeout test',
  scheduleToCloseTimeout: 'scheduleToCloseTimeout test',
  startToCloseTimeout: 'startToCloseTimeout test',
  taskList: 'test task list',
  heartbeatTimeout: 'heartbeatTimeout test',
};

export const STARTED_PARAMS = {
  identity: 'identity test',
};

export const COMPLETED_PARAMS = {
  result: 'result test',
};

export const FAILED_PARAMS = {
  reason: 'reason test',
  details: 'details test',
};

export const REQUEST_CANCELLED_PARAMS = {
  activityId: 'test activity id',
};

export const CANCELLED_PARAMS = {
  details: 'details test',
};

export const TIMEOUT_PARAMS = {
  timeoutType: 'test timeout type',
  details: 'test details',
};
