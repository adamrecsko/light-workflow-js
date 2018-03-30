import { actorClient } from '../../../core/actor/decorators/actor-decorators';
import { inject, injectable } from 'inversify';
import { TEST_ACTOR, TestActor } from '../actors/test-actor';
import {
  workflow, executionStartToCloseTimeout,
  description, version, defaultExecutionStartToCloseTimeout,
} from '../../../core/workflow/decorators/workflow-decorators';

export const TEST_WORKFLOW = Symbol('TEST_WORKFLOW');


export interface TestWorkflow {
  workflowTest1(text: string): Promise<string>;

  workflowTest2(text: string, num: number): Promise<string>;
}


@injectable()
export class TestWorkflowImpl implements TestWorkflow {
  @actorClient
  @inject(TEST_ACTOR)
  private actor: TestActor;

  @workflow()
  async workflowTest1(text: string): Promise<string> {
    const formattedText = await this.actor.formatText(text).toPromise();
    const printedText = await this.actor.printIt(formattedText).toPromise();
    return `${text}:${formattedText}:${printedText}`;
  }

  @workflow()
  @executionStartToCloseTimeout('10')
  @version('2')
  @defaultExecutionStartToCloseTimeout('13')
  async workflowTest2(text: string, num: number): Promise<string> {
    const formattedText = await this.actor.formatText(`input: ${text} num: ${num}`).toPromise();
    const formattedText2 = await this.actor.formatText(`input: ${text} num: ${num}`).toPromise();
    return `${formattedText}${formattedText2}`;
  }
}



