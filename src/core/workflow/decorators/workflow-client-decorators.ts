import { tagged } from 'inversify';

export const WORKFLOW_CLIENT_TAG = 'workflow-client-tag';
export const workflowClient = tagged(WORKFLOW_CLIENT_TAG, true);
