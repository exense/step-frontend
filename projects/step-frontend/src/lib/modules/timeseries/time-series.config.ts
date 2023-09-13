import { TimeRangePickerSelection } from './time-selection/time-range-picker-selection';
import { RangeSelectionType } from './time-selection/model/range-selection-type';
import { ResolutionPickerOption } from './components/resolution-picker/resolution-picker-option';

export class TimeSeriesConfig {
  public static readonly MAX_BUCKETS_IN_CHART = 100;
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
  static readonly RANGER_FILTER_FIELDS = ['eId', 'planId', 'taskId'];

  static readonly DEFAULT_RESOLUTION_OPTIONS: ResolutionPickerOption[] = [
    { label: '1 second', valueMs: 1000 },
    { label: '30 seconds', valueMs: 1000 },
    { label: '1 minute', valueMs: 1000 },
    { label: '15 minutes', valueMs: 1000 },
    { label: '30 minutes', valueMs: 1000 },
    { label: '1 hour', valueMs: 1000 },
    { label: '12 hours', valueMs: 1000 },
    { label: '1 day', valueMs: 1000 },
    { label: '1 week', valueMs: 1000 },
    { label: 'Auto', valueMs: 0 },
  ];

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
}

export interface RefreshInterval {
  label: string;
  value: number; // 0 if it's off
}
