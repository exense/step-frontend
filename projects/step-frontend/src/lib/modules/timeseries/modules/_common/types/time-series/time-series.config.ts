import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { MetricAttribute } from '@exense/step-core';

export class TimeSeriesConfig {
  static readonly MAX_BUCKETS_IN_CHART = 100;
  static TRAILING_ZERO_PATTERN = /\.0+$|(\.[0-9]*[1-9])0+$/;
  static readonly ONE_HOUR_MS = 3600 * 1000;
  static readonly DASHBOARD_URL_PARAMS_PREFIX = 'dc_';
  static readonly DASHBOARD_URL_FILTER_PREFIX = 'q_'; // filter params will be prefixed with both params and filter's prefix
  static readonly PARAM_KEY_EXECUTION_DASHBOARD_ID = 'plugins.timeseries.execution.dashboard.id';
  static readonly PARAM_KEY_ANALYTICS_DASHBOARD_ID = 'plugins.timeseries.analytics.dashboard.id';
  static readonly SECONDARY_AXES_KEY = 'z';
  static readonly SERIES_DEFAULT_COLOR = '#138aff';

  static readonly PCL_VALUE_PARAM = 'pclValue';
  static readonly RATE_UNIT_PARAM = 'rateUnit';

  static readonly RESPONSE_TIME_CHART_TITLE = 'Response Times';
  static readonly STATUS_ATTRIBUTE = 'rnStatus';
  static readonly ATTRIBUTES_PREFIX = 'attributes';
  static readonly TIMESTAMP_ATTRIBUTE = 'begin';
  static readonly CHART_LEGEND_SIZE = 65;
  static readonly TOTAL_BARS_COLOR = '#d3d9ee';
  static readonly OVERVIEW_COLORS = ['#cedbe3', '#c9e3f8'];
  static readonly METRIC_TYPE_KEY = 'metricType';
  static readonly METRIC_TYPE_RESPONSE_TIME = 'response-time'; // this is for normal measurements
  static readonly METRIC_TYPE_SAMPLER = 'sampler'; // this is for thread groups measurements
  static readonly THREAD_GROUP_FILTER_FIELDS = ['eId', 'planId', 'taskId'];
  static readonly EXECUTION_ID_ATTRIBUTE = 'eId';
  static readonly PLAN_ID_ATTRIBUTE = 'planId';
  static readonly TASK_ID_ATTRIBUTE = 'taskId';
  static readonly RANGER_FILTER_FIELDS = [this.EXECUTION_ID_ATTRIBUTE, this.PLAN_ID_ATTRIBUTE, this.TASK_ID_ATTRIBUTE];
  static readonly RANGER_COLORS = {
    axesStroke: '#bce8f1',
    series: '#a1d1fa',
    seriesGradientEnd: '#b3dfff',
  };
  static readonly SERIES_LABEL_EMPTY = '<Empty>';
  static readonly SERIES_LABEL_VALUE = 'Value';

  static readonly DEFAULT_GROUPING_OPTIONS = [
    { label: 'Name', attributes: ['name'] },
    { label: 'Name & Status', attributes: ['name', 'rnStatus'] },
  ];

  static readonly ANALYTICS_TIME_SELECTION_OPTIONS: TimeRangePickerSelection[] = [
    { type: 'RELATIVE', relativeSelection: { label: 'Last Minute', timeInMs: this.ONE_HOUR_MS / 60 } },
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last 15 Minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    },
    { type: 'RELATIVE', relativeSelection: { label: 'Last Hour', timeInMs: this.ONE_HOUR_MS } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last Day', timeInMs: this.ONE_HOUR_MS * 24 } },
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last Week', timeInMs: this.ONE_HOUR_MS * 24 * 7 },
    },
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last Month', timeInMs: this.ONE_HOUR_MS * 24 * 31 },
    },
  ];

  static readonly EXECUTION_PAGE_TIME_SELECTION_OPTIONS: TimeRangePickerSelection[] = [
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last 1 minute', timeInMs: this.ONE_HOUR_MS / 60 },
    },
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last 5 minutes', timeInMs: this.ONE_HOUR_MS / 12 },
    },
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last 15 minutes', timeInMs: this.ONE_HOUR_MS / 4 },
    },
    {
      type: 'RELATIVE',
      relativeSelection: { label: 'Last 30 minutes', timeInMs: this.ONE_HOUR_MS / 2 },
    },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 hour', timeInMs: this.ONE_HOUR_MS } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 hours', timeInMs: this.ONE_HOUR_MS * 3 } },
    { type: 'FULL' },
  ];

  /**
   * @Deprecated. Has to be removed after legacy dashboard is replaced.
   */
  static readonly KNOWN_ATTRIBUTES: MetricAttribute[] = [
    {
      displayName: 'Status',
      name: 'rnStatus',
      type: 'TEXT',
      metadata: { knownValues: ['PASSED', 'FAILED', 'TECHNICAL_ERROR', 'INTERRUPTED'] },
    },
    { displayName: 'Type', name: 'type', type: 'TEXT', metadata: { knownValues: ['keyword', 'custom'] } },
    { displayName: 'Origin', name: 'origin', type: 'TEXT', metadata: {} },
    { displayName: 'Task', name: 'taskId', type: 'TEXT', metadata: { entity: 'task' } },
    { displayName: 'Execution', name: 'eId', type: 'TEXT', metadata: { entity: 'execution' } },
    { displayName: 'Plan', name: 'planId', type: 'TEXT', metadata: { entity: 'plan' } },
    { displayName: 'Name', name: 'name', type: 'TEXT', metadata: {} },
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
