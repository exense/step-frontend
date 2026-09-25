import { Status } from '../../_common/shared/status.enum';

export const ITERATION_FILTER_STATUSES: readonly Status[] = [Status.PASSED, Status.FAILED, Status.TECHNICAL_ERROR];

export function getAvailableIterationStatuses(countByStatus?: Record<string, number>): Status[] {
  return Object.entries(countByStatus ?? {})
    .filter(([, count]) => count > 0)
    .map(([status]) => status as Status);
}

export function areAllIterationStatusesSelected(
  statuses: readonly Status[] | undefined,
  countByStatus?: Record<string, number>,
): boolean {
  return !statuses || getAvailableIterationStatuses(countByStatus).every((status) => statuses.includes(status));
}
