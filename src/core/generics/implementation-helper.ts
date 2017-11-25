import {Newable} from "../../implementation";

export type Binding = {
  impl: Newable<any>,
  key: symbol,
  taskLists?: string[]
};

export interface ImplementationHelper {
  addImplementations(implementationList: Binding[]): void;
}
