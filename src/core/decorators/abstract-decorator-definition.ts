import {Serializer, defaultSerializer} from "../application/serializer";
export abstract class AbstractDecoratorDefinition {
    private _decoratedMethodName: string;

    name: string;
    version: string = '1';
    description: string;
    taskPriority: string;
    defaultTaskPriority: string;
    serializer: Serializer = defaultSerializer;
    [key: string]: any;
    constructor(decoratedMethodName: string) {
        this._decoratedMethodName = decoratedMethodName;
        this.name = decoratedMethodName;
    }

    get decoratedMethodName(): string {
        return this._decoratedMethodName;
    }
}