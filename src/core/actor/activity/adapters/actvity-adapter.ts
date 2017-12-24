import { RemoteActivityObservable } from '../observable/remote-activity-observable';
export interface ActivityAdapter<P> {
  createObservable(callParams: P): RemoteActivityObservable;
}
