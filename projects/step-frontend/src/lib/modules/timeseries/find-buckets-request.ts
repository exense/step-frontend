export interface FindBucketsRequest {
  start: number;
  end: number;
  params: any;
  groupDimensions?: string[];
  numberOfBuckets?: number;
  intervalSize: number; // in ms
  threadGroupBuckets?: boolean; // custom logic is applied for thread groups buckets
  percentiles?: number[]; // optional numerical values in (0, 100) interval.
}
