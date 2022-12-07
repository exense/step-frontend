import { RefreshInterval } from './performance-view/performance-view.component';

export class TimeSeriesConfig {
  public static readonly MAX_BUCKETS_IN_CHART = 100;

  public static readonly RESPONSE_TIME_CHART_TITLE = 'Response Times';
  static readonly STATUS_ATTRIBUTE = 'rnStatus';
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
}
