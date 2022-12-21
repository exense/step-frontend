import { ViewModel } from '../../generated';

export interface ExecutionSummaryDto extends ViewModel {
  customFields?: Record<string, any>;
  count: number;
  countForecast: number;
  distribution: {
    [status: string]: {
      status: string;
      count: number;
    };
  };
  executionId: string;
  id: string;
  label: string;
  viewId: string;
}
