import { TimeRangePickerSelection } from './time-selection/time-range-picker-selection';
import { RangeSelectionType } from './time-selection/model/range-selection-type';
import { ResolutionPickerOption } from './components/resolution-picker/resolution-picker-option';

export class TimeSeriesConfig {
  public static readonly MAX_BUCKETS_IN_CHART = 100;
  public static TRAILING_ZERO_PATTERN = /\.0+$|(\.[0-9]*[1-9])0+$/;
  static readonly ONE_HOUR_MS = 3600 * 1000;

  public static readonly RESPONSE_TIME_CHART_TITLE = 'Response Times';
  static readonly STATUS_ATTRIBUTE = 'rnStatus';
  static readonly ATTRIBUTES_PREFIX = 'attributes';
  static readonly TIMESTAMP_ATTRIBUTE = 'begin';
  static readonly CHART_LEGEND_SIZE = 65;
  static readonly TOTAL_BARS_COLOR = '#7689c0';
  static readonly METRIC_TYPE_KEY = 'metricType';
  static readonly METRIC_TYPE_RESPONSE_TIME = 'response-time'; // this is for normal measurements
  static readonly METRIC_TYPE_SAMPLER = 'sampler'; // this is for thread groups measurements
  static readonly THREAD_GROUP_FILTER_FIELDS = ['eId', 'planId', 'taskId'];
  static readonly EXECUTION_ID_ATTRIBUTE = 'eId';
  static readonly PLAN_ID_ATTRIBUTE = 'planId';
  static readonly TASK_ID_ATTRIBUTE = 'taskId';
  static readonly RANGER_FILTER_FIELDS = [this.EXECUTION_ID_ATTRIBUTE, this.PLAN_ID_ATTRIBUTE, this.TASK_ID_ATTRIBUTE];
  static readonly SERIES_LABEL_EMPTY = '<Empty>';
  static readonly SERIES_LABEL_VALUE = 'Value';

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

  static readonly ANALYTICS_TIME_SELECTION_OPTIONS: TimeRangePickerSelection[] = [
    { type: RangeSelectionType.RELATIVE, relativeSelection: { label: 'Last Minute', timeInMs: this.ONE_HOUR_MS / 60 } },
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last 15 Minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    },
    { type: RangeSelectionType.RELATIVE, relativeSelection: { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS } },
    { type: RangeSelectionType.RELATIVE, relativeSelection: { label: 'Last Day', timeInMs: this.ONE_HOUR_MS * 24 } },
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last Week', timeInMs: this.ONE_HOUR_MS * 24 * 7 },
    },
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last Month', timeInMs: this.ONE_HOUR_MS * 24 * 31 },
    },
  ];

  static readonly EXECUTION_PAGE_TIME_SELECTION_OPTIONS: TimeRangePickerSelection[] = [
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last 1 minute', timeInMs: this.ONE_HOUR_MS / 60 },
    },
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last 5 minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    },
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last 15 minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    },
    {
      type: RangeSelectionType.RELATIVE,
      relativeSelection: { label: 'Last 30 minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    },
    { type: RangeSelectionType.RELATIVE, relativeSelection: { label: 'Last 1 hour', timeInMs: this.ONE_HOUR_MS } },
    { type: RangeSelectionType.RELATIVE, relativeSelection: { label: 'Last 3 hours', timeInMs: this.ONE_HOUR_MS * 3 } },
    { type: RangeSelectionType.FULL },
  ];

  static readonly AXES_FORMATTING_FUNCTIONS = {
    bigNumber: (num: number) => {
      if (num && num < 10) {
        return num.toString();
      }
      const numberSuffixes = [
        { value: 1e9, symbol: 'B' },
        { value: 1e6, symbol: 'M' },
        { value: 1e3, symbol: 'k' },
        { value: 1, symbol: '' },
      ];
      var item = numberSuffixes.find((item) => num >= item.value);
      return item ? (num / item.value).toFixed(2).replace(this.TRAILING_ZERO_PATTERN, '$1') + item.symbol : '0';
    },
    time: (milliseconds: number) => {
      const lookup = [
        { value: 3600 * 1000, symbol: ' h' }, // hours
        { value: 60 * 1000, symbol: ' m' }, // minutes
        { value: 1000, symbol: ' s' }, // seconds
        { value: 1, symbol: ' ms' }, // milliseconds
      ];
      var item = lookup.find((item) => milliseconds >= item.value);
      return item
        ? (milliseconds / item.value).toFixed(2).replace(this.TRAILING_ZERO_PATTERN, '$1') + item.symbol
        : '0 ms';
    },
  };
}

export interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}
