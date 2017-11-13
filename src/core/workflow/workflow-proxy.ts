import {WorkflowResult} from "./workflow-result";

export type Proxy = (...args: any[]) => Promise<WorkflowResult>;
export type WorkflowProxy<K> = {
  [P in keyof K]: Proxy & K[P]
  }