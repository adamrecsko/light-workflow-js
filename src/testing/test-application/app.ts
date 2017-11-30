import {injectable, inject} from "inversify";
import {HelloWorkflow, helloWorkflowSymbol} from "./workflows/hello-world";
import {workflowClient} from "../../core/workflow/decorators/workflow-client-decorators";
import {Workflows, WORKFLOWS} from "../../core/workflow/workflows";


@injectable()
export class MyApp {
  @inject(helloWorkflowSymbol)
  @workflowClient
  private helloWorkflow: HelloWorkflow;

  @inject(WORKFLOWS)
  private workflows: Workflows;

  public async start() {


    try {
      //console.log(await this.runTheHello('hello'), 'runID');
    } catch (e) {
      console.log(e);
    }

  }

  public async runTheHello(text: string): Promise<string> {
    const workflowResult = await this.workflows.start(this.helloWorkflow.halloWorld, text);
    return workflowResult.runId;
  }
}
