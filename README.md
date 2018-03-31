#  light-workflow-js
[![Build Status](https://travis-ci.org/adamrecsko/light-workflow-js.svg?branch=master)](https://travis-ci.org/adamrecsko/light-workflow-js)

A library to create, run and orchestrate AWS SWF workflow.
Written in TypeScript and heavily relies on RxJS. 

[Documentation](https://adamrecsko.github.io/light-workflow-js/) - You can find a documentation here


## Getting Started
```
  $ git clone https://github.com/adamrecsko/light-workflow-js.git
  $ cd light-workflow-js
  $ yarn install
```


### Prerequisites

You need node.js and yarn to be installed before start.

```
    $ apt-get install nodejs
    $ npm install yarn -g
```



For running a workflow on AWS you need aws credentials properly setup on your development environment
and a registered AWS SWF domain.

## Running the tests

```
    $ yarn test
```


### Running linter

Explain what these tests test and why

```
   $ yarn lint
```

## Example 

HelloWorld Application

For examples please check the [examples](examples) folder.


### Actor implementation

```typescript
import 'reflect-metadata';
import 'zone.js';

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

```
###  Workflow implementation

```typescript

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

```

###  Application implementation

```typescript

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

```
###  How to start workers and workflow

```typescript

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

// boot
// register workflow and activities

boot().catch(err => console.error(err));


```


## Built With

* [RxJS](http://reactivex.io/rxjs/)
* [TypeScript](http://www.typescriptlang.org/)
* [yarn](https://yarnpkg.com/lang/en/)
* [Zone.js](https://github.com/angular/zone.js)


## Authors

* **Adam Recsko** - *Initial work* 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* This library is under development and not production ready yet.
