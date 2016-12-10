import {tagged} from "inversify";

export const ACTOR_CLIENT_TAG = 'actor-client';
export const TASK_LIST_TAG = 'task-list-tag';

export const actorClient = tagged(ACTOR_CLIENT_TAG, true);
export const taskList = tagged.bind(null, TASK_LIST_TAG);