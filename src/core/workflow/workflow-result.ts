export interface WorkflowResult<T> {
  runId: string;
  value: Promise<T>;
}
