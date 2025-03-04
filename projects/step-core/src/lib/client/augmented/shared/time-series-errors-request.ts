import { TimeRange } from '../../generated';

export interface TimeSeriesErrorsRequest {
  timeRange: TimeRange;
  taskId?: string;
  executionId?: string;
}
