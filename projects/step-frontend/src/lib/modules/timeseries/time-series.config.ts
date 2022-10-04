export class TimeSeriesConfig {
  public static readonly DEFAULT_RESOLUTION = 1000; // if it is not received from the backend
  public static readonly MAX_BUCKETS_IN_CHART = 100;
  public static readonly SERVICE_RESOLUTION_CONFIG_PROPERTY = 'plugins.timeseries.resolution.period';
}
