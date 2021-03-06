export interface FindBucketsRequest {
  start: number;
  end: number;
  params: any;
  groupDimensions?: string[];
  numberOfBuckets?: number;
  intervalSize: number; // in ms
  threadGroupBuckets?: boolean;
}
