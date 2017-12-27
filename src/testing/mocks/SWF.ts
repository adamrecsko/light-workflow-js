import { SWF, AWSError, Config, Request } from 'aws-sdk';

export class MockSWF {

  config: Config & SWF.Types.ClientConfiguration;


  countClosedWorkflowExecutions(params: SWF.CountClosedWorkflowExecutionsInput, callback?: (err: AWSError, data: SWF.WorkflowExecutionCount) => void): Request<SWF.WorkflowExecutionCount, AWSError> {
    return null;
  }

  countOpenWorkflowExecutions(params: SWF.CountOpenWorkflowExecutionsInput, callback?: (err: AWSError, data: SWF.WorkflowExecutionCount) => void): Request<SWF.WorkflowExecutionCount, AWSError> {
    return null;
  }

  countPendingActivityTasks(params: SWF.CountPendingActivityTasksInput, callback?: (err: AWSError, data: SWF.PendingTaskCount) => void): Request<SWF.PendingTaskCount, AWSError> {
    return null;
  }

  countPendingDecisionTasks(params: SWF.CountPendingDecisionTasksInput, callback?: (err: AWSError, data: SWF.PendingTaskCount) => void): Request<SWF.PendingTaskCount, AWSError> {
    return null;
  }

  deprecateActivityType(params: SWF.DeprecateActivityTypeInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  deprecateDomain(params: SWF.DeprecateDomainInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  deprecateWorkflowType(params: SWF.DeprecateWorkflowTypeInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  describeActivityType(params: SWF.DescribeActivityTypeInput, callback?: (err: AWSError, data: SWF.ActivityTypeDetail) => void): Request<SWF.ActivityTypeDetail, AWSError> {
    return null;
  }

  describeDomain(params: SWF.DescribeDomainInput, callback?: (err: AWSError, data: SWF.DomainDetail) => void): Request<SWF.DomainDetail, AWSError> {
    return null;
  }

  describeWorkflowExecution(params: SWF.DescribeWorkflowExecutionInput, callback?: (err: AWSError, data: SWF.WorkflowExecutionDetail) => void): Request<SWF.WorkflowExecutionDetail, AWSError> {
    return null;
  }

  describeWorkflowType(params: SWF.DescribeWorkflowTypeInput, callback?: (err: AWSError, data: SWF.WorkflowTypeDetail) => void): Request<SWF.WorkflowTypeDetail, AWSError> {
    return null;
  }

  getWorkflowExecutionHistory(params: SWF.GetWorkflowExecutionHistoryInput, callback?: (err: AWSError, data: SWF.History) => void): Request<SWF.History, AWSError> {
    return null;
  }

  listActivityTypes(params: SWF.ListActivityTypesInput, callback?: (err: AWSError, data: SWF.ActivityTypeInfos) => void): Request<SWF.ActivityTypeInfos, AWSError> {
    return null;
  }

  listClosedWorkflowExecutions(params: SWF.ListClosedWorkflowExecutionsInput, callback?: (err: AWSError, data: SWF.WorkflowExecutionInfos) => void): Request<SWF.WorkflowExecutionInfos, AWSError> {
    return null;
  }

  listDomains(params: SWF.ListDomainsInput, callback?: (err: AWSError, data: SWF.DomainInfos) => void): Request<SWF.DomainInfos, AWSError> {
    return null;
  }

  listOpenWorkflowExecutions(params: SWF.ListOpenWorkflowExecutionsInput, callback?: (err: AWSError, data: SWF.WorkflowExecutionInfos) => void): Request<SWF.WorkflowExecutionInfos, AWSError> {
    return null;
  }

  listWorkflowTypes(params: SWF.ListWorkflowTypesInput, callback?: (err: AWSError, data: SWF.WorkflowTypeInfos) => void): Request<SWF.WorkflowTypeInfos, AWSError> {
    return null;
  }

  pollForActivityTask(params: SWF.PollForActivityTaskInput, callback?: (err: AWSError, data: SWF.ActivityTask) => void): Request<SWF.ActivityTask, AWSError> {
    return null;
  }

  pollForDecisionTask(params: SWF.PollForDecisionTaskInput, callback?: (err: AWSError, data: SWF.DecisionTask) => void): Request<SWF.DecisionTask, AWSError> {
    throw new Error('not implemented');
  }

  recordActivityTaskHeartbeat(params: SWF.RecordActivityTaskHeartbeatInput, callback?: (err: AWSError, data: SWF.ActivityTaskStatus) => void): Request<SWF.ActivityTaskStatus, AWSError> {
    return null;
  }

  registerActivityType(params: SWF.RegisterActivityTypeInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  registerDomain(params: SWF.RegisterDomainInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  registerWorkflowType(params: SWF.RegisterWorkflowTypeInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  requestCancelWorkflowExecution(params: SWF.RequestCancelWorkflowExecutionInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  respondActivityTaskCanceled(params: SWF.RespondActivityTaskCanceledInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  respondActivityTaskCompleted(params: SWF.RespondActivityTaskCompletedInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  respondActivityTaskFailed(params: SWF.RespondActivityTaskFailedInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  respondDecisionTaskCompleted(params: SWF.RespondDecisionTaskCompletedInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  signalWorkflowExecution(params: SWF.SignalWorkflowExecutionInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }

  startWorkflowExecution(params: SWF.StartWorkflowExecutionInput, callback?: (err: AWSError, data: SWF.Run) => void): Request<SWF.Run, AWSError> {
    return null;
  }

  terminateWorkflowExecution(params: SWF.TerminateWorkflowExecutionInput, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return null;
  }
}
