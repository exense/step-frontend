import { Status } from '../../_common/shared/status.enum';

export const ITERATION_FILTER_STATUSES: readonly Status[] = [Status.PASSED, Status.FAILED, Status.TECHNICAL_ERROR];

export function areAllIterationStatusesSelected(statuses?: readonly Status[]): boolean {
  return !statuses || ITERATION_FILTER_STATUSES.every((status) => statuses.includes(status));
}
