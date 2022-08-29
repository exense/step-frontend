import { Bucket } from './bucket';

export interface TimeSeriesChartResponse {
  start: number; // timestamp
  end: number; // timestamp
  interval: number; // in milliseconds
  matrix: Bucket[][]; // the actual buckets. every series is a row
  matrixKeys: any[]; // mapping between series data and series properties. First item here correspond to the first row in the 'matrix' attribute
}
