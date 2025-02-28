import { MultiLevelItem } from '@exense/step-core';

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
  ESTIMATING = 'ESTIMATING',
  PROVISIONING = 'PROVISIONING',
  DEPROVISIONING = 'DEPROVISIONING',
  IMPORT_ERROR = 'IMPORT_ERROR',
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
  Status.ESTIMATING,
  Status.PROVISIONING,
  Status.DEPROVISIONING,
];

export const EXECUTION_ENDED_STATUSES: ReadonlyArray<Status> = [
  Status.TECHNICAL_ERROR,
  Status.FAILED,
  Status.PASSED,
  Status.INTERRUPTED,
  Status.SKIPPED,
  Status.IMPORT_ERROR,
];

export const EXECUTION_STATUS_TREE: MultiLevelItem<Status>[] = [
  ...[
    Status.INITIALIZING,
    Status.IMPORTING,
    Status.ESTIMATING,
    Status.PROVISIONING,
    Status.DEPROVISIONING,
    Status.RUNNING,
    Status.ABORTING,
    Status.EXPORTING,
  ].map((key) => ({
    key,
    value: key,
  })),
  {
    key: Status.ENDED,
    value: Status.ENDED,
    children: EXECUTION_ENDED_STATUSES.map((key) => ({
      key,
      value: key,
    })),
  },
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
