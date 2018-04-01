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
import { FailedException, TimeoutException } from '../../src/core/actor/activity/observable/remote-activity-observable-exceptions';
import { pipe } from 'rxjs/Rx';
import { catchError } from 'rxjs/operators';

const HELLO_WORLD_ACTOR = Symbol('HELLO_WORLD_ACTOR');

export interface HelloWorld {
  formatText(text: string): Observable<string>;

  printIt(text: string): Observable<string>;

  throwException(): Observable<string>;

  firstTryTimeOut(num: number): Observable<string>;
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

  @activity()
  @version('1')
  @description('this activity always dies')
  throwException(): Observable<string> {
    throw new Error('Activity died unexpectedly');
  }

  @activity()
  @version('1')
  @description('this activity time out for the first try')
  firstTryTimeOut(num: number): Observable<string> {
    if (num === 0) {
      return Observable.never();
    }
    return Observable.of('I am okay');
  }
}

export const HELLO_WORLD_WORKFLOW = Symbol('HELLO_WORLD_WORKFLOW');


export interface HelloWorldWorkflow {
  helloWorld(text: string): Promise<string>;

  helloWorldWithErrorHandling(): Promise<string>;

  helloWorkflowWithRetry(): Promise<string>;

  helloWorldHandleErrorWithObservables(): Observable<any>;
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

  @workflow()
  async helloWorldWithErrorHandling() {
    try {
      await this.actor.throwException().toPromise();
    } catch (e) {
      if (e instanceof FailedException) {
        return 'Error handled';
      }
      throw e;
    }
  }

  @workflow()
  async helloWorkflowWithRetry() {
    try {
      await this.actor.firstTryTimeOut(0).toPromise();
    } catch (e) {
      if (e instanceof TimeoutException) {
        return await this.actor.firstTryTimeOut(1).toPromise();
      }
      throw Error('Unknown error');
    }
  }

  @workflow()
  helloWorldHandleErrorWithObservables() {
    const errorHandler = catchError(err => of('Error handled, no problem!'));
    return this.actor.throwException().let(errorHandler);
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

  public async startHelloWorld(text: string): Promise<string> {
    const start = this.workflows.createStarter(MyApp.domain, 'default');
    const workflowResult = await start(this.workflow.helloWorld, text);
    return workflowResult.runId;
  }

  public async startHelloWorldWithRetry(): Promise<string> {
    const start = this.workflows.createStarter(MyApp.domain, 'default');
    const workflowResult = await start(this.workflow.helloWorkflowWithRetry);
    return workflowResult.runId;
  }

  public async startHelloWorldWithErrorHandling(): Promise<string> {
    const start = this.workflows.createStarter(MyApp.domain, 'default');
    const workflowResult = await start(this.workflow.helloWorldWithErrorHandling);
    return workflowResult.runId;
  }

  public async startHelloWorldErrorHandleWithObservables(): Promise<string> {
    const start = this.workflows.createStarter(MyApp.domain, 'default');
    const workflowResult = await start(this.workflow.helloWorldHandleErrorWithObservables);
    return workflowResult.runId;
  }

  public createWorkflowWorker(): WorkflowWorker<HelloWorld> {
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
  const workflowWorker = app.createWorkflowWorker();
  const actorWorker = app.createActorWorker();


  await workflowWorker.register().toPromise();
  await actorWorker.register().toPromise();

  workflowWorker.startWorker();
  actorWorker.startWorker();

  //await  app.startHelloWorldWithErrorHandling();
  //await  app.startHelloWorld('World');
  //await  app.startHelloWorldWithRetry();
  await app.startHelloWorldErrorHandleWithObservables();


}

boot().catch(err => console.error(err));


