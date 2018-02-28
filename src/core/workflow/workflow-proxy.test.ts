import { suite, test } from 'mocha-typescript';
import { LocalWorkflowStub } from './workflow-proxy';
import {
  defaultChildPolicy, defaultExecutionStartToCloseTimeout, defaultLambdaRole, defaultTaskList, defaultTaskPriority, defaultTaskStartToCloseTimeout, description, version,
  workflow, name,
} from './decorators/workflow-decorators';
import { expect } from 'chai';


class TestWfImpl {
  @workflow()
  @version('12')
  @defaultChildPolicy('TERMINATE')
  @defaultExecutionStartToCloseTimeout('10')
  @defaultLambdaRole('arn:...')
  @defaultTaskList({ name: 'default-task-list' })
  @defaultTaskPriority('task-priority')
  @defaultTaskStartToCloseTimeout('20')
  @description('this is a workflow')
  async workflowName() {
    return 4;
  }

  @workflow()
  @name('test-wf')
  @description('test')
  @version('1-b')
  async thisIsJustATest(a: string, b: number) {
    return {
      a,
      b,
    };
  }

}


@suite
class LocalWorkflowStubTest {

  workflowStub: LocalWorkflowStub<TestWfImpl>;

  before() {
    const instance = new TestWfImpl();
    this.workflowStub = new LocalWorkflowStub(TestWfImpl, instance);
  }

  @test
  shouldHasWorkflow() {
    expect(this.workflowStub.isWorkflowExists({ name: 'workflowName', version: '12' })).to.be.true;
    expect(this.workflowStub.isWorkflowExists({ name: 'test-wf', version: '1-b' })).to.be.true;
  }

  @test
  shouldNotHasWorkflow() {
    expect(this.workflowStub.isWorkflowExists({ name: 'thisIsJustATest', version: '1b' })).to.be.false;
  }

  @test
  async shouldCallWorkflowWorkflowInstanceMethod() {
    const testInput = JSON.stringify(['test', 27]);
    const result = await this.workflowStub.callWorkflowWithInput({ name: 'test-wf', version: '1-b' }, testInput);

    expect(result).to.eql({
      a: 'test',
      b: 27,
    });
  }
}
