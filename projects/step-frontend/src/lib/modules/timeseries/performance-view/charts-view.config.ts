import { ThroughputMetric } from './model/throughput-metric';
import { ThroughputMetricType } from '../model/throughput-metric-type';
import { TimeSeriesUtils } from '../time-series-utils';
import { BucketResponse } from '@exense/step-core';
import { ResponseTimeMetric } from './model/response-time-metric';
import { TimeSeriesConfig } from '../time-series.config';

export class ChartsViewConfig {
  public static responseTimeMetrics: ResponseTimeMetric[] = [
    {
      label: 'Avg',
      mapFunction: (b: BucketResponse) => {
        return b ? Math.round(b.sum / Math.max(b.count, 1)) : undefined;
      },
    },
    { label: 'Min', mapFunction: (b: BucketResponse) => b?.min },
    { label: 'Max', mapFunction: (b: BucketResponse) => b?.max },
    { label: 'Perc. 90', mapFunction: (b: BucketResponse) => b?.pclValues?.[90] },
    { label: 'Perc. 99', mapFunction: (b: BucketResponse) => b?.pclValues?.[99] },
  ];

  public static throughputMetrics: ThroughputMetric[] = [
    {
      label: ThroughputMetricType.TPH,
      mapFunction: (b: BucketResponse) => (b ? b.throughputPerHour : 0),
      labelFunction: (v: number) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v)}/h`,
      tooltipZAxisLabel: 'Total Hits/h',
    },
    {
      label: ThroughputMetricType.TPM,
      mapFunction: (b: BucketResponse) => (b ? b.throughputPerHour / 60 : 0),
      labelFunction: (v: number) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v)}/m`,
      tooltipZAxisLabel: 'Total Hits/m',
    },
    {
      label: ThroughputMetricType.TPS,
      mapFunction: (b: BucketResponse) => (b ? b.throughputPerHour / (60 * 60) : 0),
      labelFunction: (v: number) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v)}/s`,
      tooltipZAxisLabel: 'Total Hits/s',
    },
  ];
}
