import { ThroughputMetric } from './model/throughput-metric';
import { ThroughputMetricType } from '../model/throughput-metric-type';
import { Bucket } from '../bucket';
import { TimeSeriesUtils } from '../time-series-utils';

export class PerformanceViewConfig {
  public static responseTimeMetrics = [
    { label: 'Avg', mapFunction: (b: Bucket) => Math.round(b.sum / b.count) },
    { label: 'Min', mapFunction: (b: Bucket) => b.min },
    { label: 'Max', mapFunction: (b: Bucket) => b.max },
    { label: 'Perc. 90', mapFunction: (b: Bucket) => b.pclValues[90] },
    { label: 'Perc. 99', mapFunction: (b: Bucket) => b.pclValues[99] },
  ];

  public static throughputMetrics: ThroughputMetric[] = [
    {
      label: ThroughputMetricType.TPH,
      mapFunction: (b: Bucket) => (b ? b.throughputPerHour : 0),
      labelFunction: (value: number) => `${TimeSeriesUtils.formatAxisValue(value)}/h`,
      tooltipZAxisLabel: 'Total Hits/h',
    },
    {
      label: ThroughputMetricType.TPM,
      mapFunction: (b: Bucket) => (b ? b.throughputPerHour / 60 : 0),
      labelFunction: (value: number) => `${TimeSeriesUtils.formatAxisValue(value)}/m`,
      tooltipZAxisLabel: 'Total Hits/m',
    },
    {
      label: ThroughputMetricType.TPS,
      mapFunction: (b: Bucket) => (b ? b.throughputPerHour / 60 / 60 : 0),
      labelFunction: (value: number) => `${TimeSeriesUtils.formatAxisValue(value)}/s`,
      tooltipZAxisLabel: 'Total Hits/s',
    },
  ];
}
