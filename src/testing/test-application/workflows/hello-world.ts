import {actorClient} from "../../../application/actor/decorators/actor-decorators";
import {inject} from "inversify";
import {helloSymbol, Hello} from "../actors/hello";

export const helloWorkflowSymbol = Symbol('helloWorkflow');


export interface HelloWorkflow {
    helloWorld(text: string): Promise<any>
}

export class HelloWorkflowImpl implements HelloWorkflow {
    @actorClient
    @inject(helloSymbol)
    private hello: Hello;

    async helloWorld(text: string): Promise<string> {
        const formattedText = await this.hello.formatText(text).toPromise();
        return this.hello.printIt(formattedText).toPromise();
    }
}