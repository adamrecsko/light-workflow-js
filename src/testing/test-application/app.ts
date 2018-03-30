import { injectable, inject } from 'inversify';
import { workflowClient } from '../../core/workflow/decorators/workflow-client-decorators';
import { Workflows, WORKFLOWS } from '../../core/workflow/workflows';
import { WORKFLOW_WORKER_FACTORY, WorkflowWorkerFactory } from '../../core/workflow/worker/workflow-worker-factory';

import { WorkflowWorker } from '../../core/workflow/worker/workflow-worker';
import { TEST_WORKFLOW, TestWorkflow, TestWorkflowImpl } from './workflows/test-workflow';

@injectable()
export class MyApp {
  public static domain = 'test-domain';
  @inject(TEST_WORKFLOW)
  @workflowClient
  private workflow: TestWorkflow;
  @inject(WORKFLOWS)
  private workflows: Workflows;
  @inject(WORKFLOW_WORKER_FACTORY)
  private workerFactory: WorkflowWorkerFactory;

  public async registerWorkflows() {
    const worker = this.workerFactory.create(MyApp.domain, {
      key: TEST_WORKFLOW,
      impl: TestWorkflowImpl,
    });
    await worker.register().toPromise();
  }

  public async start() {
    try {
      return await this.runTestWorkflow1('test-data');
    } catch (e) {
      console.log(e);
    }
  }

  public async runTestWorkflow1(text: string): Promise<string> {
    const start = this.workflows.createStarter('test-domain');
    const workflowResult = await start(this.workflow.workflowTest1, text);
    return workflowResult.runId;
  }

  public createWorker(): WorkflowWorker<TestWorkflow> {
    return this.workerFactory.create(MyApp.domain, {
      key: TEST_WORKFLOW,
      impl: TestWorkflowImpl,
    });
  }

}
