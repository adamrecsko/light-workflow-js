import {injectable, inject} from "inversify";
import {HelloWorkflow, helloWorkflowSymbol} from "./workflows/hello-world";

@injectable()
export class MyApp {
    @inject(helloWorkflowSymbol)
    private helloWorkflow: HelloWorkflow;

    public start(): void {

    }

    public runTheHello(text: string): Promise<any> {
        return this.helloWorkflow.helloWorld(text).toPromise();
    }
}
