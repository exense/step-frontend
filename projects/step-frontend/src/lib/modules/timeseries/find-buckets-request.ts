export interface FindBucketsRequest {
  start: number;
  end: number;
  params: { [key: string]: string };
  groupDimensions?: string[];
  numberOfBuckets?: number;
  intervalSize?: number; // in ms
  percentiles?: number[]; // optional numerical values in (0, 100) interval.
}
