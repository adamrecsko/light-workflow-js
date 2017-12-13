export enum ActivityTimeoutType {
    START_TO_CLOSE = 1,
    SCHEDULE_TO_START,
    SCHEDULE_TO_CLOSE,
    HEARTBEAT,
}

export namespace ActivityTimeoutType {
    export function fromString(eventType: string): ActivityTimeoutType {
      return (<any> ActivityTimeoutType)[eventType];
    }
}
