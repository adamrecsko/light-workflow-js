import 'zone.js';
import { ContextResolutionStrategy } from './resolution-stategy';

export class ContextNotFoundException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ZoneContextResolutionStrategy<T> implements ContextResolutionStrategy<T> {
  constructor(private contextKey: string) {
  }

  public getContext(): T {
    const context: T = Zone.current.get(this.contextKey);
    if (!context) {
      throw new ContextNotFoundException(`Context with key: ${this.contextKey} not found in current zone: ${ Zone.current.name}`);
    }
    return context;
  }
}
