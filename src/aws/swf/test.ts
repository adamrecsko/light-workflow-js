import { injectable } from "inversify";

export  interface Test {
    doIt():string
}


@injectable()
export class BaseTest implements Test {
    doIt():string {
        console.log('DO IT');
        return "fafas";
    }
}
