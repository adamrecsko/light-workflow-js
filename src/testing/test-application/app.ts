import {injectable, inject} from "inversify";
import {HelloWorkflow, helloWorkflowSymbol} from "./workflows/hello-world";
import {WorkflowResult} from "../../core/workflow/workflow-result";
import {WorkflowProxy} from "../../core/workflow/workflow-proxy";


@injectable()
export class MyApp {
    @inject(helloWorkflowSymbol)
    private helloWorkflow: WorkflowProxy<HelloWorkflow>;

    public start(): void {

    }

    public runTheHello(text: string): Promise<WorkflowResult> {
        return this.helloWorkflow.helloWorld(text);
    }
}
