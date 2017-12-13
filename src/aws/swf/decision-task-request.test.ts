import { DecisionTaskRequest } from './decision-task-request';
import { WorkflowClient } from '../workflow-client';
import { ActivityPollParameters, ActivityTask, DecisionTask, HistoryEvent, DecisionPollParameters } from '../aws.types';
import { Observable, TestScheduler } from 'rxjs';
import { expect } from 'chai';
import { TestMessage } from 'rxjs/testing/TestMessage';
import * as sinon from 'sinon';
import { MockWorkflowClient } from '../../testing/mocks/workflow-client';


function generateHistoryEventList(from: number, to: number): HistoryEvent[] {
  const historyEvents: HistoryEvent[] = [];
  for (let i = from; i <= to; i++) {
    const event: HistoryEvent = {
      eventTimestamp: new Date(i),
      eventType: 'EventType',
      eventId: i,
    };
    historyEvents.push(event);
  }

  return historyEvents;
}

function generateDecisionTask(nextPageToken: string, events: HistoryEvent[]): DecisionTask {
  const decisionTask: DecisionTask = {
    events,
    nextPageToken,
    taskToken: 'task-token',
    startedEventId: 10,
    workflowExecution: { workflowId: 'workflowId', runId: 'runId' },
    workflowType: { name: 'type', version: '123' },
    previousStartedEventId: 10,
  };

  return decisionTask;
}



describe('DecisionPollerObservable', () => {
  context('if paging needed', () => {
    it('should merge the decision list if it has next page', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const expectedMergedEvent = generateDecisionTask(null, generateHistoryEventList(0, 30));
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(0, 7))));
      stub.onSecondCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(8, 15))));
      stub.onThirdCall()
                .returns(Observable.of(generateDecisionTask(null, generateHistoryEventList(16, 30))));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      testScheduler.expectObservable(decisionTaskRequest).toBe('(a|)', { a: expectedMergedEvent });

      testScheduler.flush();
    });

    it('should call pollForDecisionTask (n) times if (n) page exists', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', [])));
      stub.onSecondCall()
                .returns(Observable.of(generateDecisionTask('haveNext', [])));
      stub.onThirdCall()
                .returns(Observable.of(generateDecisionTask(null, [])));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      decisionTaskRequest.subscribe();
      testScheduler.flush();
      sinon.assert.calledThrice(stub);
    });

    it('should call pollForDecisionTask with the nextPageToken', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', [])));
      stub.onSecondCall()
                .returns(Observable.of(generateDecisionTask('haveNext2', [])));
      stub.onThirdCall()
                .returns(Observable.of(generateDecisionTask(null, [])));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      decisionTaskRequest.subscribe();
      testScheduler.flush();
      expect(stub.firstCall.args[0]).to.eq(parameters);
      expect(stub.secondCall.args[0]).to.eql(parameters.nextPage('haveNext'));
      expect(stub.thirdCall.args[0]).to.eql(parameters.nextPage('haveNext2'));
    });

  });


  context('if no paging needed', () => {

    it('should call pollForDecisionTask with the given parameters', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask(null, [])));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      decisionTaskRequest.subscribe();
      testScheduler.flush();
      sinon.assert.calledWith(stub, parameters);
    });

    it('should emit the decision task without merge', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const expectedMergedEvent = generateDecisionTask(null, generateHistoryEventList(0, 7));
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask(null, generateHistoryEventList(0, 7))));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      testScheduler.expectObservable(decisionTaskRequest).toBe('(a|)', { a: expectedMergedEvent });

      testScheduler.flush();
    });
    it('should call pollForDecisionTask 1 time if 1 page exist', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask(null, [])));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      decisionTaskRequest.subscribe();
      testScheduler.flush();
      sinon.assert.calledOnce(stub);
    });
  });


  context('if error happens during the request', () => {
    it('should emit the error', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      const error = new Error('test error');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(0, 7))));
      stub.onSecondCall()
                .returns(Observable.throw(error));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      testScheduler.expectObservable(decisionTaskRequest).toBe('#', null, error);

      testScheduler.flush();
    });
    it('should stop paging', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      const error = new Error('test error');
      stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(0, 7))));
      stub.onSecondCall()
                .returns(Observable.throw(error));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      decisionTaskRequest.subscribe(() => {
      },                            () => {
      });
      testScheduler.flush();
      sinon.assert.calledTwice(stub);
    });
  });

  context('if the request result is empty', () => {
    it('should emit empty object and complete', () => {
      const parameters = new DecisionPollParameters();
      const mockSwfRx: WorkflowClient = new MockWorkflowClient();
      const expectedResult = {};
      const stub = sinon.stub(mockSwfRx, 'pollForDecisionTask');
      stub.onFirstCall()
                .returns(Observable.of({}));

      const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage) => {
        expect(a).to.eql(b);
      });
      const decisionTaskRequest = new DecisionTaskRequest(parameters, mockSwfRx, testScheduler);
      testScheduler.expectObservable(decisionTaskRequest).toBe('(a|)', { a: expectedResult });
      testScheduler.flush();
    });
  });

});
