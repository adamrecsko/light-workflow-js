import { Serializer, defaultSerializer } from '../../application/serializer';
export abstract class AbstractDecoratorDefinition {
  private methodName: string;
  name: string;
  version = '1';
  description: string;
  taskPriority: string;
  serializer: Serializer = defaultSerializer;
  [key: string]: any;
  constructor(decoratedMethodName: string) {
    this.methodName = decoratedMethodName;
    this.name = decoratedMethodName;
  }

  get decoratedMethodName(): string {
    return this.methodName;
  }
}
