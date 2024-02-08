import { ThroughputMetric } from './throughput-metric';
import { BucketResponse } from '@exense/step-core';
import { ResponseTimeMetric } from './response-time-metric';
import { TimeSeriesConfig, ThroughputMetricType } from '../../_common';

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
      labelFunction: (value: number) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(value)}/h`,
      tooltipZAxisLabel: 'Total Hits/h',
    },
    {
      label: ThroughputMetricType.TPM,
      mapFunction: (b: BucketResponse) => (b ? b.throughputPerHour / 60 : 0),
      labelFunction: (value: number) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(value)}/m`,
      tooltipZAxisLabel: 'Total Hits/m',
    },
    {
      label: ThroughputMetricType.TPS,
      mapFunction: (b: BucketResponse) => (b ? b.throughputPerHour / (60 * 60) : 0),
      labelFunction: (value: number) => `${TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(value)}/s`,
      tooltipZAxisLabel: 'Total Hits/s',
    },
  ];
}
