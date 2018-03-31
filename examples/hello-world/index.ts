import 'reflect-metadata';
import 'zone.js';

import { Observable } from 'rxjs/Observable';
import { inject, injectable } from 'inversify';
import { activity, description, version } from '../../src/core/actor/activity/decorators/activity-decorators';
import { of } from 'rxjs/observable/of';
import { actorClient } from '../../src/core/actor/decorators/actor-decorators';
import { workflow } from '../../src/core/workflow/decorators/workflow-decorators';
import { workflowClient } from '../../src/core/workflow/decorators/workflow-client-decorators';
import { Workflows, WORKFLOWS } from '../../src/core/workflow/workflows';
import { WORKFLOW_WORKER_FACTORY, WorkflowWorkerFactory } from '../../src/core/workflow/worker/workflow-worker-factory';
import { ACTOR_WORKER_FACTORY, ActorWorkerFactory } from '../../src/core/actor/worker/actor-worker-factory';
import { WorkflowWorker } from '../../src/core/workflow/worker/workflow-worker';
import { ActorWorker } from '../../src/core/actor/worker/actor-worker';
import { BaseApplicationConfigurationProvider } from '../../src/core/application/application-configuration-provider';
import { ConfigurableApplicationFactory } from '../../src/core/application/application-factory';
import { SWF } from 'aws-sdk';
import { ApplicationConfiguration } from '../../src/core/application/application-configuration';

const HELLO_WORLD_ACTOR = Symbol('HELLO_WORLD_ACTOR');

export interface HelloWorld {
  formatText(text: string): Observable<string>;

  printIt(text: string): Observable<string>;
}

@injectable()
export class HelloWorldImpl implements HelloWorld {
  private printer(text: string) {
    console.log(text);
  }

  @activity()
  @version('1')
  formatText(text: string): Observable<string> {
    return of('Hello' + text);
  }

  @activity()
  @version('1')
  @description('print the text out')
  printIt(text: string): Observable<string> {
    return of(text).do((text: string) => {
      this.printer(text);
    });
  }
}

export const HELLO_WORLD_WORKFLOW = Symbol('HELLO_WORLD_WORKFLOW');


export interface HelloWorldWorkflow {
  helloWorld(text: string): Promise<string>;
}


@injectable()
export class HelloWorldWorkflowImpl implements HelloWorldWorkflow {
  @actorClient
  @inject(HELLO_WORLD_ACTOR)
  private actor: HelloWorld;

  @workflow()
  async helloWorld(text: string) {
    const formattedText = await this.actor.formatText(text).toPromise();
    const printedText = await this.actor.printIt(formattedText).toPromise();
    return printedText;
  }
}

@injectable()
export class MyApp {
  public static domain = 'test-domain';
  @inject(HELLO_WORLD_WORKFLOW)
  @workflowClient
  private workflow: HelloWorldWorkflow;
  @inject(WORKFLOWS)
  private workflows: Workflows;
  @inject(WORKFLOW_WORKER_FACTORY)
  private workerFactory: WorkflowWorkerFactory;
  @inject(ACTOR_WORKER_FACTORY)
  private actorWorkerFactory: ActorWorkerFactory;

  public async register() {
    const worker = this.workerFactory.create(MyApp.domain, {
      key: HELLO_WORLD_WORKFLOW,
      impl: HelloWorldWorkflowImpl,
    });
    await worker.register().toPromise();
  }

  public async start() {
    try {
      return await this.startHelloWorld('World');
    } catch (e) {
      console.log(e);
    }
  }

  public async startHelloWorld(text: string): Promise<string> {
    const start = this.workflows.createStarter(MyApp.domain, 'default');
    const workflowResult = await start(this.workflow.helloWorld, text);
    return workflowResult.runId;
  }

  public createWorklfowWorker(): WorkflowWorker<HelloWorld> {
    return this.workerFactory.create(MyApp.domain, {
      key: HELLO_WORLD_WORKFLOW,
      impl: HelloWorldWorkflowImpl,
    });
  }

  public createActorWorker(): ActorWorker {
    return this.actorWorkerFactory.create(MyApp.domain, {
      key: HELLO_WORLD_ACTOR,
      impl: HelloWorldImpl,
    });
  }
}


async function boot() {
  const swf = new SWF({ region: 'us-east-1' });
  const config = new ApplicationConfiguration(swf);
  const configProvider = new BaseApplicationConfigurationProvider(config);
  const applicationFactory = new ConfigurableApplicationFactory(configProvider);
  applicationFactory.addActorImplementations([
    {
      impl: HelloWorldImpl,
      key: HELLO_WORLD_ACTOR,
    },
  ]);

  applicationFactory.addWorkflowImplementations([
    {
      impl: HelloWorldWorkflowImpl,
      key: HELLO_WORLD_WORKFLOW,
      taskLists: ['default'],
    },
  ]);


  const app = applicationFactory.createApplication<MyApp>(MyApp);
  const workflowWorker = app.createWorklfowWorker();
  const actorWorker = app.createActorWorker();


  await workflowWorker.register().toPromise();
  await actorWorker.register().toPromise();

  workflowWorker.startWorker();
  actorWorker.startWorker();

  const res = await  app.start();

  console.log(res);
}

boot().catch(err => console.error(err));


