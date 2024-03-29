export enum Status {
  UNKNOW = 'UNKNOW',
  ENDED = 'ENDED',
  INITIALIZING = 'INITIALIZING',
  IMPORTING = 'IMPORTING',
  RUNNING = 'RUNNING',
  ABORTING = 'ABORTING',
  SKIPPED = 'SKIPPED',
  NORUN = 'NORUN',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  TECHNICAL_ERROR = 'TECHNICAL_ERROR',
  INTERRUPTED = 'INTERRUPTED',
  EXPORTING = 'EXPORTING',
}

export const EXECUTION_RESULT: ReadonlyArray<Status> = [
  Status.TECHNICAL_ERROR,
  Status.FAILED,
  Status.PASSED,
  Status.INTERRUPTED,
  Status.SKIPPED,
  Status.NORUN,
  Status.RUNNING,
];

export const EXECUTION_STATUS: ReadonlyArray<Status> = [
  Status.INITIALIZING,
  Status.IMPORTING,
  Status.RUNNING,
  Status.ABORTING,
  Status.EXPORTING,
  Status.ENDED,
];

export const REPORT_NODE_STATUS: ReadonlyArray<Status> = [
  Status.TECHNICAL_ERROR,
  Status.FAILED,
  Status.PASSED,
  Status.INTERRUPTED,
  Status.SKIPPED,
  Status.NORUN,
  Status.RUNNING,
];

export const TEST_RUN_STATUS = REPORT_NODE_STATUS;
