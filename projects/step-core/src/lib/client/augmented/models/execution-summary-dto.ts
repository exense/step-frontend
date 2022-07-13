export interface ExecutionSummaryDto {
  count: number;
  countForecast: number;
  customFields: unknown;
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
