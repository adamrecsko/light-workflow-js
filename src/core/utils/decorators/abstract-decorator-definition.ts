import { Serializer, defaultSerializer } from '../../application/serializer';
export class AbstractDecoratorDefinition {
  private readonly methodName: string;
  name: string;
  version = '1';
  description: string;
  taskPriority: string;
  serializer: Serializer = defaultSerializer;
  constructor(decoratedMethodName: string) {
    this.methodName = decoratedMethodName;
    this.name = decoratedMethodName;
  }

  get decoratedMethodName(): string {
    return this.methodName;
  }
}
