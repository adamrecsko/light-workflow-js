import { injectable, inject } from 'inversify';
import { helloWorkflowSymbol, test } from './workflows/hello-world';
import { workflowClient } from '../../core/workflow/decorators/workflow-client-decorators';
import { Workflows, WORKFLOWS } from '../../core/workflow/workflows';

import HelloWorkflow = test.HelloWorkflow;
import { WORKFLOW_WORKER_FACTORY, WorkflowWorkerFactory } from '../../core/workflow/worker/workflow-worker-factory';
import HelloWorkflowImpl = test.HelloWorkflowImpl;
import { WorkflowWorker } from '../../core/workflow/worker/workflow-worker';

@injectable()
export class MyApp {

  public static domain = 'test-domain';

  @inject(helloWorkflowSymbol)
  @workflowClient
  private helloWorkflowClient: HelloWorkflow;

  @inject(WORKFLOWS)
  private workflows: Workflows;

  @inject(WORKFLOW_WORKER_FACTORY)
  private workerFactory: WorkflowWorkerFactory;


  public async registerWorkflows() {

    const worker = this.workerFactory.create(MyApp.domain, {
      key: helloWorkflowSymbol,
      impl: HelloWorkflowImpl,
    });

    await worker.register().toPromise();
  }

  public async start() {

    try {
      return await this.runTheHello('hello');
    } catch (e) {
      console.log(e);
    }

  }

  public async runTheHello(text: string): Promise<string> {
    const start = this.workflows.createStarter('test-domain');
    const workflowResult = await start(this.helloWorkflowClient.halloWorld, text);
    return workflowResult.runId;
  }


  public createWorker(): WorkflowWorker<HelloWorkflow> {
    return this.workerFactory.create(MyApp.domain, {
      key: helloWorkflowSymbol,
      impl: HelloWorkflowImpl,
    });
  }

}
