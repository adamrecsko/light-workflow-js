import {WorkflowResult} from "./workflow-result";


export interface WorkflowFn {

  <A, B, C, D, E, R> (wf: (param1: A, param2: B, param3: C, param4: D, param5: E) => Promise<R>, param1: A, param2: B, param3: C, param4: D, param5: E): Promise<WorkflowResult<R>>;

  <A, B, C, D, R> (wf: (param1: A, param2: B, param3: C, param4: D) => Promise<R>, param1: A, param2: B, param3: C, param4: D): Promise<WorkflowResult<R>>;

  <A, B, C, R> (wf: (param1: A, param2: B, param3: C) => Promise<R>, param1: A, param2: B, param3: C): Promise<WorkflowResult<R>>;

  <A, B, R> (wf: (param1: A, param2: B) => Promise<R>, param1: A, param2: B): Promise<WorkflowResult<R>>;

  <A, R> (wf: (param1: A) => Promise<R>, param1: A): Promise<WorkflowResult<R>>;

  <R> (wf: () => Promise<R>): Promise<WorkflowResult<R>>;
}


export interface WorkflowUtils {
  start: WorkflowFn;
}
