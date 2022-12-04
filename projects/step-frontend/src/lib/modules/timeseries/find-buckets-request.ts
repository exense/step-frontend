export interface FindBucketsRequest {
  start?: number; // TODO deprecated
  end?: number; // TODO deprecated
  oqlFilter?: string;
  params?: { [key: string]: string }; // TODO deprecated
  groupDimensions?: string[];
  numberOfBuckets?: number;
  intervalSize?: number; // in ms
  percentiles?: number[]; // optional numerical values in (0, 100) interval.
}
