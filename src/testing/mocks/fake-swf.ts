import { DecisionTask, HistoryEvent } from '../../aws/aws.types';
import { BaseWorkflowDecisionPollGenerator, WorkflowDecisionPollGenerator } from '../helpers/workflow-decision-poll-generator';
import { WorkflowHistoryGenerator } from '../helpers/workflow-history-generator';
import { Subject } from 'rxjs/Subject';

export class FakeSWF {
  private currentPosition = 0;
  private workflowPollGenerator: WorkflowDecisionPollGenerator = new BaseWorkflowDecisionPollGenerator();
  private workflowEventGenerator = new WorkflowHistoryGenerator();
  private eventList: HistoryEvent[] = [];
  private readonly pollResp: DecisionTask;
  private readonly startEvent: HistoryEvent;
  public completedEvents: any[] = [];

  public completedEventChangeSubject: Subject<any> = new Subject();


  public setEventList(eventList: HistoryEvent[]): void {
    this.eventList = [this.startEvent, ...eventList];
    this.currentPosition = 0;
  }

  constructor(eventList: HistoryEvent[] = [],
              private delayms = 100,
              private decisionTask: Partial<DecisionTask> = {},
              private input: any) {

    this.startEvent = this.workflowEventGenerator.createStartedEvent({
      input: JSON.stringify(input),
      workflowType: decisionTask.workflowType,
    });

    this.setEventList(eventList);

    this.pollResp = this.workflowPollGenerator.generateTask({
      nextPageToken: null,
      startedEventId: 1,
      ...this.decisionTask,
    });
  }

  private getCurrentEventList(): DecisionTask {
    if (this.currentPosition < this.eventList.length) {
      this.currentPosition++;
    }
    const activityEvents = this.eventList.slice(0, this.currentPosition);
    return {
      ...this.pollResp,
      events: activityEvents,
    };
  }

  pollForDecisionTask(params: any, cb: any) {
    setTimeout(
      () => {
        const resp = this.getCurrentEventList();
        cb(null, resp);
      },
      this.delayms);
  }

  respondDecisionTaskCompleted(params: any, cb: any) {
    this.completedEvents.push(params);
    this.completedEventChangeSubject.next(params);
    setTimeout(
      () => {
        cb();
      });
  }

}

