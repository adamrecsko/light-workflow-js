import {actorClient} from "../../../core/actor/decorators/actor-decorators";
import {inject} from "inversify";
import {helloSymbol, Hello} from "../actors/hello";
import {workflow, executionStartToCloseTimeout} from "../../../core/workflow/decorators/workflow-decorators";

export const helloWorkflowSymbol = Symbol('helloWorkflow');


export interface HelloWorkflow {
    helloWorld(text: string): Promise<any>
}

export class HelloWorkflowImpl implements HelloWorkflow {
    @actorClient
    @inject(helloSymbol)
    private hello: Hello;


    @workflow
    async helloWorld(text: string): Promise<string> {
        const formattedText = await this.hello.formatText(text).toPromise();
        return this.hello.printIt(formattedText).toPromise();
    }


    @workflow
    @executionStartToCloseTimeout('10')
    async halloWorld(text: string): Promise<string> {
        const formattedText = await this.hello.formatText(`${text} hallo`).toPromise();
        return this.hello.printIt(formattedText).toPromise();
    }
}