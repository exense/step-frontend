export interface Bucket {
  begin: number; // timestamp - the starting point of the accumulated interval
  attributes: any;
  count: number; // how many points were collected
  sum: number; // suma of collected points
  min: number;
  max: number;
  pclValues: { [key: number]: number }; // percentiles.
  throughputPerHour: number; // count value in relationship to its duration.
}
