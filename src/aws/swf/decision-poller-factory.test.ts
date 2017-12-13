import 'reflect-metadata';
import { WorkflowClient } from '../workflow-client';
import { ActivityPollParameters, ActivityTask, DecisionTask, DecisionPollParameters } from '../aws.types';
import { Observable } from 'rxjs';
import { expect } from 'chai';
import { TaskPollerObservable } from './task-poller-observable';
import { GenericDecisionPollerFactory } from './decision-poller-factory';
import { DecisionTaskRequest } from './decision-task-request';
import { MockWorkflowClient } from '../../testing/mocks/workflow-client';

describe('GenericDecisionPollerFactory', () => {
  it('should return an DecisionPollerObservable', () => {
    const mockSwfRx: WorkflowClient = new MockWorkflowClient();
    const decisionPollerFactory = new GenericDecisionPollerFactory(mockSwfRx);
    const decisionPollParameters = new DecisionPollParameters();
    const poller: TaskPollerObservable<DecisionTask> = decisionPollerFactory.createPoller(decisionPollParameters);
    expect(poller).to.instanceOf(TaskPollerObservable);
    expect(poller.innerObservable).to.instanceOf(DecisionTaskRequest);
  });
});
