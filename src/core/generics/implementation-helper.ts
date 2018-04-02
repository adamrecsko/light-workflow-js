import { Newable } from '../../implementation';

export type Binding<T = any> = {
  impl: Newable<T>,
  key: symbol,
};

export interface ImplementationHelper {
  addImplementations<T>(implementationList: Binding<T>[]): void;
}
