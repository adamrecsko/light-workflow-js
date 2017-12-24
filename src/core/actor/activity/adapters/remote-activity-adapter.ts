import { ActivityAdapter } from './actvity-adapter';
import { ContextResolutionStrategy } from '../../../context/resolution-strategies/resolution-stategy';
import { DecisionRunContext } from '../../../context/decision-run-context';
import { ScheduleActivityTaskDecisionAttributes } from '../../../../aws/aws.types';
import { ActivityDefinition } from '../activity-definition';
import {
    DefaultRemoteObservableFactory, RemoteObservableFactory,
    RemoteActivityObservable,
} from '../observable/remote-activity-observable';
import { Serializer } from '../../../application/serializer';
import { injectable } from 'inversify';


export interface RemoteActivityAdapter extends ActivityAdapter<any[]> {
  createObservable(callParams: any[]): RemoteActivityObservable;
}

export class DefaultRemoteActivityAdapter implements RemoteActivityAdapter {
  constructor(private contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
              private activityDefinition: ActivityDefinition,
              private taskList: string,
              private observableFactory?: RemoteObservableFactory) {
    this.observableFactory = observableFactory || new DefaultRemoteObservableFactory();
  }

  public createObservable(callParams: any[]): RemoteActivityObservable {
    const context: DecisionRunContext = this.contextResolutionStrategy.getContext();
    const activityId = context.getNextId();
    const serializer = this.activityDefinition.serializer;

    const attributes = DefaultRemoteActivityAdapter.createScheduleAttributes(this.activityDefinition, this.taskList, callParams, activityId);

    return this.observableFactory.create(context, attributes, serializer);
  }


  private static createScheduleAttributes(activityDefinition: ActivityDefinition, taskList: string, callParams: any[], activityId: string): ScheduleActivityTaskDecisionAttributes {
    const serializer: Serializer = activityDefinition.serializer;
    const input = serializer.stringify(callParams);

    const attributes: ScheduleActivityTaskDecisionAttributes = {
      activityId,
      input,
      activityType: {
        name: activityDefinition.name,
        version: activityDefinition.version,
      },
      scheduleToCloseTimeout: activityDefinition.scheduleToCloseTimeout,
      taskList: {
        name: taskList,
      },
      scheduleToStartTimeout: activityDefinition.scheduleToStartTimeout,
      startToCloseTimeout: activityDefinition.startToCloseTimeout,
      heartbeatTimeout: activityDefinition.heartbeatTimeout,
    };

    return attributes;
  }

}


export interface RemoteActivityAdapterFactory {
  create(contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
         activityDefinition: ActivityDefinition,
         taskList: string,
         observableFactory?: RemoteObservableFactory): RemoteActivityAdapter;
}

@injectable()
export class DefaultRemoteActivityAdapterFactory implements RemoteActivityAdapterFactory {
  create(contextResolutionStrategy: ContextResolutionStrategy<DecisionRunContext>,
         activityDefinition: ActivityDefinition,
         taskList: string,
         observableFactory?: RemoteObservableFactory): DefaultRemoteActivityAdapter {
    return new DefaultRemoteActivityAdapter(contextResolutionStrategy, activityDefinition, taskList, observableFactory);
  }
}
