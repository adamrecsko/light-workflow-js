import {DecisionPollerObservable} from './decision-poller-observable';
import {SwfRx} from "../swf-rx";
import {ActivityPollParameters, ActivityTask, DecisionTask, HistoryEvent, DecisionPollParameters} from "../aws.types";
import {Observable, TestScheduler} from "rxjs";
import {expect} from "chai";
import {TestMessage} from "rxjs/testing/TestMessage";
import * as sinon from "sinon";


function generateHistoryEventList(from: number, to: number): HistoryEvent[] {
    const historyEvents: HistoryEvent[] = [];
    for (let i = from; i <= to; i++) {
        const event: HistoryEvent = {
            eventTimestamp: `${i}timestamp`,
            eventType: 'EventType',
            eventId: i
        };
        historyEvents.push(event);
    }

    return historyEvents;
}

function generateDecisionTask(nextPageToken: string, events: HistoryEvent[]): DecisionTask {
    const decisionTask: DecisionTask = {
        taskToken: 'task-token',
        startedEventId: 10,
        workflowExecution: {workflowId: 'workflowId', runId: 'runId'},
        workflowType: {name: 'type'},
        events: events,
        nextPageToken,
        previousStartedEventId: 10
    };

    return decisionTask;
}


class MockSwfRx implements SwfRx {
    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
        return null;
    }

    pollForDecisionTask(params: any): Observable<DecisionTask> {
        return null;
    }
}


describe('DecisionPollerObservable', ()=> {


    context('if paging needed', ()=> {
        it('should merge the decision list if it has next page', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const expectedMergedEvent = generateDecisionTask(null, generateHistoryEventList(0, 30));
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(0, 7))));
            stub.onSecondCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(8, 15))));
            stub.onThirdCall()
                .returns(Observable.of(generateDecisionTask(null, generateHistoryEventList(16, 30))));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            testScheduler.expectObservable(decisionListPoller).toBe('(a|)', {a: expectedMergedEvent});

            testScheduler.flush();
        });

        it('should call pollForDecisionTask (n) times if (n) page exists', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', [])));
            stub.onSecondCall()
                .returns(Observable.of(generateDecisionTask('haveNext', [])));
            stub.onThirdCall()
                .returns(Observable.of(generateDecisionTask(null, [])));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            decisionListPoller.subscribe();
            testScheduler.flush();
            sinon.assert.callCount(stub, 3);
        });

    });


    context('if no paging needed', ()=> {
        it('should emit the decision task without merge', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const expectedMergedEvent = generateDecisionTask(null, generateHistoryEventList(0, 7));
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask(null, generateHistoryEventList(0, 7))));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            testScheduler.expectObservable(decisionListPoller).toBe('(a|)', {a: expectedMergedEvent});

            testScheduler.flush();
        });
        it('should call pollForDecisionTask 1 time if 1 page exist', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask(null, [])));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            decisionListPoller.subscribe();
            testScheduler.flush();
            sinon.assert.callCount(stub, 1);
        });
    });


    context('if error happens during the request', ()=> {
        it('should emit the error', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            const error = new Error('test error');
            stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(0, 7))));
            stub.onSecondCall()
                .returns(Observable.throw(error));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            testScheduler.expectObservable(decisionListPoller).toBe('#', null, error);

            testScheduler.flush();
        });
        it('should stop paging', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            const error = new Error('test error');
            stub.onFirstCall()
                .returns(Observable.of(generateDecisionTask('haveNext', generateHistoryEventList(0, 7))));
            stub.onSecondCall()
                .returns(Observable.throw(error));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            decisionListPoller.subscribe(()=> {
            }, ()=> {
            });
            testScheduler.flush();
            sinon.assert.callCount(stub, 2);
        });
    });

    context('if the request result is empty', ()=> {
        it('should emit empty object and complete', ()=> {
            const parameters = new DecisionPollParameters();
            const mockSwfRx: SwfRx = new MockSwfRx();
            const expectedResult = {};
            const stub = sinon.stub(mockSwfRx, "pollForDecisionTask");
            stub.onFirstCall()
                .returns(Observable.of({}));

            const testScheduler = new TestScheduler((a: TestMessage, b: TestMessage)=> {
                expect(a).to.eql(b);
            });
            const decisionListPoller = new DecisionPollerObservable(parameters, mockSwfRx, testScheduler);
            testScheduler.expectObservable(decisionListPoller).toBe('(a|)', {a: expectedResult});
            testScheduler.flush();
        });
    });

});