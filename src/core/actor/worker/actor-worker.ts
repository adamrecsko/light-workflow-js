import { TaskPollerObservable } from '../../../aws/swf/task-poller-observable';
import { ActivityTask } from '../../../aws/aws.types';
import { WorkflowClient } from '../../../aws/workflow-client';
import { Binding } from '../../generics/implementation-helper';
import { getDefinitionsFromClass } from '../../utils/decorators/utils';
import { Observable } from 'rxjs/Observable';
import { ActivityDefinition } from '../activity/activity-definition';
import { AWSError } from 'aws-sdk';
import { RegisterActivityTypeInput } from 'aws-sdk/clients/swf';

import { Container } from 'inversify';
import { LocalStub } from '../../utils/local-stub';
import { of } from 'rxjs/observable/of';
import { Logger } from '../../logging/logger';


export interface ActorWorker {

  register(): Observable<void>;

  startWorker(): void;

}

export class BaseActorWorker implements ActorWorker {


  constructor(private workflowClient: WorkflowClient,
              private domain: string,
              private appContainer: Container,
              private activityPoller: TaskPollerObservable<ActivityTask>,
              private binding: Binding,
              private logger: Logger) {
  }

  private activityDefinitionToRegisterActivityTpeInput(definition: ActivityDefinition): RegisterActivityTypeInput {
    return {
      domain: this.domain,
      name: definition.name,
      version: definition.version,
      description: definition.description,
      defaultTaskStartToCloseTimeout: definition.defaultTaskStartToCloseTimeout,
      defaultTaskHeartbeatTimeout: definition.defaultTaskHeartbeatTimeout,
      defaultTaskList: definition.defaultTaskList,
      defaultTaskPriority: definition.defaultTaskPriority,
      defaultTaskScheduleToStartTimeout: definition.defaultTaskScheduleToStartTimeout,
      defaultTaskScheduleToCloseTimeout: definition.defaultTaskScheduleToCloseTimeout,
    };
  }

  private registerActivity(definition: ActivityDefinition): Observable<any> {
    const activityInput = this.activityDefinitionToRegisterActivityTpeInput(definition);
    return this.workflowClient
      .registerActivityType(activityInput)
      .catch((error: AWSError) => {
        if (error.code === 'TypeAlreadyExistsFault') {
          return Observable.empty();
        }
        return Observable.throw(error);
      });
  }

  public register(): Observable<any> {
    const definitions = getDefinitionsFromClass<ActivityDefinition>(this.binding.impl);
    return Observable.from(definitions)
      .flatMap((def: ActivityDefinition) => this.registerActivity(def), 1)
      .toArray();
  }

  createStub(): LocalStub {
    const instance = this.appContainer.get(this.binding.key);
    return new LocalStub(this.binding.impl, instance, this.logger);
  }

  respondActivityFinished(taskToken: string, result: string): Observable<any> {
    return this.workflowClient.respondActivityTaskCompleted({
      taskToken,
      result,
    }).map(() => result).catch((err) => {
      console.error(err);
      return Observable.empty();
    });
  }

  respondActivityTaskFailed(taskToken: string, details: string, reason: string): Observable<any> {
    return this.workflowClient.respondActivityTaskFailed({
      taskToken,
      details,
      reason,
    }).catch((err) => {
      console.error(err);
      return Observable.empty();
    });
  }

  public startWorker(): void {
    const stub = this.createStub();
    this.activityPoller.flatMap((activityTask: ActivityTask) => of(activityTask)
      .flatMap((activityTask: ActivityTask) => stub.callMethodWithInput(activityTask.activityType, activityTask.input))
      .do(
        result => this.logger.debug('Activity %s finished: %s', activityTask.activityType, result),
        err => this.logger.debug('Activity %s failed: %s %s', activityTask.activityType, err.message, err.details),
      )
      .flatMap(activityResult => this.respondActivityFinished(activityTask.taskToken, activityResult))
      .catch(err => this.respondActivityTaskFailed(activityTask.taskToken, err.details, err.message)))
      .subscribe(() => {
        this.logger.debug('Activity respond success');
      });
  }
}
