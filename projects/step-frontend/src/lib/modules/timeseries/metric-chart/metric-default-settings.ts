import { TSChartSettings } from '../chart/model/ts-chart-settings';
import { MetricChartType } from './metric-chart-type';

export interface MetricChartSettings {
  title: string;
  metricAttribute: string;
  autoResize: boolean;
}

export class MetricDefaultSettings {
  private static settings: Record<MetricChartType, MetricChartSettings> = {
    [MetricChartType.CPU]: {
      title: 'CPU Usage',
      metricAttribute: 'response-time',
      autoResize: true,
    },
    [MetricChartType.MEMORY]: {
      title: 'Memory usage (GB)',
      metricAttribute: 'memory',
      autoResize: true,
    },
  };

  static getSettings(metric: MetricChartType): MetricChartSettings {
    const setting = this.settings[metric];
    if (!setting) {
      throw new Error('Settings not found for metric: ' + metric);
    }
    return setting;
  }
}
