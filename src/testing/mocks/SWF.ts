import {SWF, Swf} from "aws-sdk";
import {Endpoint} from "aws-sdk";
export class MockSWF implements SWF {

    endpoint: Endpoint;

    pollForActivityTask(params: any, callback: (err: any, data: Swf.ActivityTask) => void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    pollForDecisionTask(params: any, callback: (err: any, data: Swf.DecisionTask) => void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    startWorkflowExecution(params: any, callback: (err: any, data: Swf.StartWorkflowExecutionResult) => void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    countClosedWorkflowExecutions(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    countOpenWorkflowExecutions(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    countPendingActivityTasks(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    countPendingDecisionTasks(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    deprecateActivityType(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    deprecateDomain(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    deprecateWorkflowType(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    describeActivityType(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    describeDomain(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    describeWorkflowExecution(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    describeWorkflowType(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    getWorkflowExecutionHistory(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    listActivityTypes(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    listClosedWorkflowExecutions(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    listDomains(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    listOpenWorkflowExecutions(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    listWorkflowTypes(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }


    recordActivityTaskHeartbeat(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    registerActivityType(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    registerDomain(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    registerWorkflowType(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    requestCancelWorkflowExecution(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    respondActivityTaskCanceled(params: Swf.RespondActivityTaskCanceledRequest, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    respondActivityTaskCompleted(params: Swf.RespondActivityTaskCompletedRequest, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    respondActivityTaskFailed(params: Swf.RespondActivityTaskFailedRequest, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    respondDecisionTaskCompleted(params: Swf.RespondDecisionTaskCompletedRequest, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }

    signalWorkflowExecution(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }


    terminateWorkflowExecution(params: any, callback: (err: any, data: any)=>void): void {
        throw new Error('MockSWF: Unimplemented Exception - Mock the method in the test');
    }
}