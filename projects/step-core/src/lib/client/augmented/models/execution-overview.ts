import { Execution } from '../../generated';
import { ResolvedExecutionNotice } from './resolved-execution-notice';

export interface ExecutionOverview {
  execution: Execution;
  resolvedNotices: ResolvedExecutionNotice[];
}
