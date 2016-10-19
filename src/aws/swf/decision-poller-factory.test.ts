import "reflect-metadata";
import {SwfRx} from "../swf-rx";
import {ActivityPollParameters, ActivityTask, DecisionTask, DecisionPollParameters} from "../aws.types";
import {Observable} from "rxjs";
import {expect} from 'chai';
import {TaskPollerObservable} from "./task-poller-observable";
import {GenericDecisionPollerFactory} from "./decision-poller-factory";
import {DecisionTaskRequest} from "./decision-task-request";

class MockSwfRx implements SwfRx {
    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
        return null;
    }

    pollForDecisionTask(params: any): Observable<DecisionTask> {
        return null;
    }
}

describe('GenericDecisionPollerFactory', ()=> {
    it('should return an DecisionPollerObservable', ()=> {
        const mockSwfRx: SwfRx = new MockSwfRx();
        const decisionPollerFactory = new GenericDecisionPollerFactory(mockSwfRx);
        const decisionPollParameters = new DecisionPollParameters();
        const poller: TaskPollerObservable<DecisionTask> = decisionPollerFactory.createPoller(decisionPollParameters);
        expect(poller).to.instanceOf(TaskPollerObservable);
        expect(poller.innerObservable).to.instanceOf(DecisionTaskRequest);
    });
});