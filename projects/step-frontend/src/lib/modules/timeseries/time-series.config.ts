import { RefreshInterval } from './performance-view/performance-view.component';
import { RelativeTimeSelection } from './time-selection/model/relative-time-selection';

export class TimeSeriesConfig {
  public static readonly MAX_BUCKETS_IN_CHART = 100;
  static readonly ONE_HOUR_MS = 3600 * 1000;

  public static readonly RESPONSE_TIME_CHART_TITLE = 'Response Times';
  static readonly STATUS_ATTRIBUTE = 'rnStatus';
  static readonly TIMESTAMP_ATTRIBUTE = 'begin';
  static readonly CHART_LEGEND_SIZE = 65;
  static readonly TOTAL_BARS_COLOR = '#7689c0';

  static readonly AUTO_REFRESH_INTERVALS: RefreshInterval[] = [
    { label: '5 Sec', value: 5000 },
    { label: '30 Sec', value: 30 * 1000 },
    { label: '1 Min', value: 60 * 1000 },
    { label: '5 Min', value: 5 * 60 * 1000 },
    { label: '30 Min', value: 30 * 60 * 1000 },
    { label: 'Off', value: 0 },
  ];

  static readonly DEFAULT_GROUPING_OPTIONS = [
    { label: 'Name', attributes: ['name'] },
    { label: 'Name & Status', attributes: ['name', 'rnStatus'] },
  ];

  static readonly SYNTHETIC_MONITORING_TIME_OPTIONS: RelativeTimeSelection[] = [
    { label: 'Last Minute', timeInMs: this.ONE_HOUR_MS / 60 },
    { label: 'Last 15 Minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS },
    { label: 'Last Day', timeInMs: this.ONE_HOUR_MS * 24 },
    { label: 'Last Week', timeInMs: this.ONE_HOUR_MS * 24 * 7 },
    { label: 'Last Month', timeInMs: this.ONE_HOUR_MS * 24 * 31 },
  ];
}
