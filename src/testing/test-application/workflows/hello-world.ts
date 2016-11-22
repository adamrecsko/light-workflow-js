import {Observable} from "rxjs";
import {actorClient} from "../../../application/actor/decorators/actor-decorators";
import {inject} from "inversify";
import {helloSymbol, Hello} from "../actors/hello";

export const helloWorkflowSymbol = Symbol('helloWorkflow');

export interface HelloWorkflow {
    helloWorld(text: string): Observable<any>
}

export class HelloWorkflowImpl implements HelloWorkflow {
    @actorClient
    @inject(helloSymbol)
    private hello: Hello;


    helloWorld(text: string): Observable<any> {
        return this.hello
            .formatText(text)
            .flatMap((fText: string)=> this.hello.printIt(fText));
    }
}