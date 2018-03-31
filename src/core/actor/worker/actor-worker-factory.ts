import { WorkflowClient } from '../../../aws/workflow-client';
import { ACTIVITY_POLLER_FACTORY, APP_CONTAINER, WORKFLOW_CLIENT } from '../../../symbols';
import { ActivityPollParameters } from '../../../aws/aws.types';
import { Container, inject, injectable } from 'inversify';
import { Binding } from '../../generics/implementation-helper';
import { ActorWorker, BaseActorWorker } from './actor-worker';
import { ActivityPollerFactory } from '../../../aws/swf/activity-poller-factory';
import { LOGGER, Logger } from '../../logging/logger';


export const ACTOR_WORKER_FACTORY = Symbol('ACTOR_WORKER_FACTORY');


export interface ActorWorkerFactory {
  create<T>(domain: string, binding: Binding<T>): ActorWorker;
}


@injectable()
export class BaseActorWorkerFactory implements ActorWorkerFactory {
  constructor(@inject(WORKFLOW_CLIENT)
              private workflowClient: WorkflowClient,
              @inject(APP_CONTAINER)
              private appContainer: Container,
              @inject(ACTIVITY_POLLER_FACTORY)
              private pollerFactory: ActivityPollerFactory,
              @inject(LOGGER)
              private logger: Logger) {

  }

  create<T>(domain: string, binding: Binding<T>): ActorWorker {
    // TODO: params missing (task list)
    const pollParams = new ActivityPollParameters(domain, { name: 'default' });

    const poller = this.pollerFactory.createPoller(pollParams);
    return new BaseActorWorker(this.workflowClient, domain, this.appContainer, poller, binding, this.logger);
  }
}
