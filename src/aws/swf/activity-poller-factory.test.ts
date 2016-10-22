import "reflect-metadata";
import {GenericActivityPollerFactory} from './activity-poller-factory';
import {WorkflowClient} from "../workflow-client";
import {ActivityPollParameters, ActivityTask, DecisionTask} from "../aws.types";
import {Observable} from "rxjs";
import * as sinon from "sinon";
import {expect} from 'chai';
import {TaskPollerObservable} from "./task-poller-observable";

class MockSwfRx implements WorkflowClient {
    pollForActivityTask(params: ActivityPollParameters): Observable<ActivityTask> {
        return null;
    }

    pollForDecisionTask(params: any): Observable<DecisionTask> {
        return null;
    }
}

describe('GenericActivityPollerFactory', ()=> {
    it('should return an ActivityPollerObservable', ()=> {
        const mockSwfRx: WorkflowClient = new MockSwfRx();
        const mockObs = {obs: 'obs'};
        sinon.stub(mockSwfRx, "pollForActivityTask", ()=>mockObs);
        const gpf = new GenericActivityPollerFactory(mockSwfRx);
        const activityPollParameters = new ActivityPollParameters('domain', {name: 'taskList'}, 'identity');
        const poller: TaskPollerObservable<ActivityTask> = gpf.createPoller(activityPollParameters);
        expect(poller).to.instanceOf(TaskPollerObservable);
        expect(poller.innerObservable).to.eq(mockObs);

    });
    it('should call swfRx pollForActivityTask with the poll parameters', ()=> {
        const mockSwfRx: WorkflowClient = new MockSwfRx();
        const mockObs = {};
        const testPollForActivityTask = sinon.stub(mockSwfRx, "pollForActivityTask", ()=>mockObs);
        const gpf = new GenericActivityPollerFactory(mockSwfRx);
        const activityPollParameters = new ActivityPollParameters('domain', {name: 'taskList'}, 'identity');
        const poller = gpf.createPoller(activityPollParameters);
        sinon.assert.calledWith(testPollForActivityTask, activityPollParameters);
    });
});