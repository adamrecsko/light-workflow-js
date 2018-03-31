import { injectable, inject } from 'inversify';
import { workflowClient } from '../../core/workflow/decorators/workflow-client-decorators';
import { Workflows, WORKFLOWS } from '../../core/workflow/workflows';
import { WORKFLOW_WORKER_FACTORY, WorkflowWorkerFactory } from '../../core/workflow/worker/workflow-worker-factory';

import { WorkflowWorker } from '../../core/workflow/worker/workflow-worker';
import { TEST_WORKFLOW, TestWorkflow, TestWorkflowImpl } from './workflows/test-workflow';
import { ActorWorker } from '../../core/actor/worker/actor-worker';
import { ACTOR_WORKER_FACTORY, ActorWorkerFactory } from '../../core/actor/worker/actor-worker-factory';
import { TEST_ACTOR, TestActorImpl } from './actors/test-actor';

@injectable()
export class MyApp {
  public static domain = 'test1234';
  @inject(TEST_WORKFLOW)
  @workflowClient
  private workflow: TestWorkflow;
  @inject(WORKFLOWS)
  private workflows: Workflows;
  @inject(WORKFLOW_WORKER_FACTORY)
  private workerFactory: WorkflowWorkerFactory;
  @inject(ACTOR_WORKER_FACTORY)
  private actorWorkerFactory: ActorWorkerFactory;

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
    const start = this.workflows.createStarter(MyApp.domain, 'default');
    const workflowResult = await start(this.workflow.workflowTest1, text);
    return workflowResult.runId;
  }

  public createWorker(): WorkflowWorker<TestWorkflow> {
    return this.workerFactory.create(MyApp.domain, {
      key: TEST_WORKFLOW,
      impl: TestWorkflowImpl,
    });
  }

  public createActorWorker(): ActorWorker {
    return this.actorWorkerFactory.create(MyApp.domain, {
      key: TEST_ACTOR,
      impl: TestActorImpl,
    });
  }
}
