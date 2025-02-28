export interface TimeSeriesErrorEntry {
  errorMessage: string;
  errorCode: number;
  count: number;
  percentage: number;
  executionIds: string[];
  executionIdsTruncated: boolean;
  types: string[]; // can be more when using same error code/message
}
