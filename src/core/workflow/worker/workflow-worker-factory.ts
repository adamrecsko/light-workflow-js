import { Binding } from '../../generics/implementation-helper';
import { BaseWorkflowWorker, WorkflowWorker } from './workflow-worker';
import { Container, inject, injectable } from 'inversify';
import { WorkflowClient } from '../../../aws/workflow-client';
import { APP_CONTAINER, CONTEXT_CACHE, DECISION_POLLER_FACTORY, WORKFLOW_CLIENT } from '../../../symbols';
import { DecisionPollerFactory } from '../../../aws/swf/decision-poller-factory';
import { DecisionPollParameters } from '../../../aws/aws.types';
import { ContextCache } from '../../context/context-cache';
import { LOGGER, Logger } from '../../logging/logger';

export const WORKFLOW_WORKER_FACTORY = Symbol('WORKFLOW_WORKER_FACTORY');


export interface WorkflowWorkerFactory {
  create<T>(domain: string, bindings: Binding<T>[]): WorkflowWorker<T>;
}


@injectable()
export class BaseWorkflowWorkerFactory implements WorkflowWorkerFactory {
  constructor(@inject(WORKFLOW_CLIENT)
              private workflowClient: WorkflowClient,
              @inject(APP_CONTAINER)
              private appContainer: Container,
              @inject(DECISION_POLLER_FACTORY)
              private decisionPollerFactory: DecisionPollerFactory,
              @inject(CONTEXT_CACHE)
              private contextCache: ContextCache,
              @inject(LOGGER)
              private logger: Logger) {

  }

  create<T>(domain: string, bindings: Binding<T>[]): WorkflowWorker<T> {
    // TODO: params missing (task list)
    const pollParams = new DecisionPollParameters();
    pollParams.domain = domain;
    pollParams.taskList = {
      name: 'default',
    };

    const poller = this.decisionPollerFactory.createPoller(pollParams);
    return new BaseWorkflowWorker(this.workflowClient, this.appContainer, this.contextCache, poller, domain, bindings, this.logger);
  }
}
