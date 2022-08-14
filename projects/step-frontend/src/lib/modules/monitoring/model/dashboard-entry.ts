import { Execution, ExecutiontTaskParameters } from '@exense/step-core';

export interface DashboardEntry {
  schedulerTask: ExecutiontTaskParameters;
  lastExecution: Execution;
  lastExecutionBeforeResultChange: Execution;
  simplifiedStatus: 'TECHNICAL_ERROR' | 'FAILED' | 'PASSED' | 'INTERRUPTED' | 'SKIPPED' | 'NORUN' | 'RUNNING';
  position: number;

  [key: string]: any;
}
