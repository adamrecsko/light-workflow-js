import { defaultExecutionStartToCloseTimeout, workflow } from '../../../core/workflow/decorators/workflow-decorators';
import { Hello, helloSymbol } from '../actors/hello';
import { inject, injectable } from 'inversify';
import { actorClient } from '../../../core/actor/decorators/actor-decorators';
import { TEST_ACTOR, TestActor } from '../actors/test-actor';


export const TEST_WORKFLOW = Symbol('TEST_WORKFLOW');

export interface TestWorkflow {
  testWorkflowMethod(text: string, num: number): Promise<string>;
}

@injectable()
export class TestWorkflowImpl implements TestWorkflow {
  @actorClient
  @inject(TEST_ACTOR)
  private testActor: TestActor;

  @workflow()
  async testWorkflowMethod(text: string, num: number): Promise<string> {
    return await this.testActor.testMethod(text, num).toPromise();
  }
}