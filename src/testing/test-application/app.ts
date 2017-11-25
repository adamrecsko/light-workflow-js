import {injectable, inject} from "inversify";
import {HelloWorkflow, helloWorkflowSymbol} from "./workflows/hello-world";
import {workflowClient} from "../../core/workflow/decorators/workflow-client-decorators";
import {WorkflowUtils} from "../../core/workflow/workflow-utils";


@injectable()
export class MyApp {
  @inject(helloWorkflowSymbol)
  @workflowClient
  private helloWorkflow: HelloWorkflow;

  private workflow: WorkflowUtils;

  public async start() {


  }

  public async runTheHello(text: string): Promise<string> {
    const workflowResult = await this.workflow.start(this.helloWorkflow.halloWorld, 'hello');
    return await workflowResult.value;
  }
}
