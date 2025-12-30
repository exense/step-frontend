export interface ExecutionResultSnapshot {
  id: string;
  status:
    | 'INITIALIZING'
    | 'IMPORTING'
    | 'ESTIMATING'
    | 'PROVISIONING'
    | 'RUNNING'
    | 'ABORTING'
    | 'FORCING_ABORT'
    | 'DEPROVISIONING'
    | 'EXPORTING'
    | 'ENDED';
  result:
    | 'VETOED'
    | 'IMPORT_ERROR'
    | 'TECHNICAL_ERROR'
    | 'FAILED'
    | 'INTERRUPTED'
    | 'PASSED'
    | 'SKIPPED'
    | 'NORUN'
    | 'RUNNING';
}
