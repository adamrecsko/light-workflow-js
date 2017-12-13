import { actorClient } from '../../../core/actor/decorators/actor-decorators';
import { inject } from 'inversify';
import { helloSymbol, Hello } from '../actors/hello';
import {
  workflow, executionStartToCloseTimeout,
  description, version, defaultExecutionStartToCloseTimeout,
} from '../../../core/workflow/decorators/workflow-decorators';

export const helloWorkflowSymbol = Symbol('helloWorkflow');


export namespace test {

  export interface HelloWorkflow {
    helloWorld(text: string): Promise<string>;

    halloWorld(text: string): Promise<string>;
  }


  export class HelloWorkflowImpl implements HelloWorkflow {
    @actorClient
    @inject(helloSymbol)
    private hello: Hello;

    @workflow()
    async helloWorld(text: string): Promise<string> {
      const formattedText = await this.hello.formatText(text).toPromise();
      await this.hello.formatText(text).toPromise();
      await this.hello.formatText(text).retry(3).toPromise();
      return this.hello.printIt(formattedText).toPromise();
    }

    @workflow()
    @executionStartToCloseTimeout('10')
    @version('7-test')
    @defaultExecutionStartToCloseTimeout('13')
    async halloWorld(text: string): Promise<string> {
      const formattedText = await this.hello.formatText(`${text} hallo`).toPromise();
      return this.hello.printIt(formattedText).toPromise();
    }
  }
}


