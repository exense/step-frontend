export interface Bucket {
  begin: number;
  attributes: any;
  count: number;
  sum: number;
  min: number;
  max: number;
  pclPrecisions: { [key: number]: number };
}
