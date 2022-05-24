export interface FindBucketsRequest {
  start: number;
  end: number;
  params: any;
  groupDimensions?: [];
  numberOfBuckets?: number;
  intervalSize?: number; // in ms
}
