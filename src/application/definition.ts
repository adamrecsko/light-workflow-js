import {Serializer, defaultSerializer} from "./activity/serializer";
export class BaseDefinition {
    name: string;
    version: string = '1';
    description: string;
    taskPriority: string;
    defaultTaskPriority: string;
    serializer: Serializer = defaultSerializer;
    _decoratedMethodName: string;
    [key: string]: any;
    constructor(decoratedMethodName: string) {
        this._decoratedMethodName = decoratedMethodName;
        this.name = decoratedMethodName;
    }

}