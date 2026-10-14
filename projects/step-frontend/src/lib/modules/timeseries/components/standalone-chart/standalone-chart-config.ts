import { AxesSettings, MetricAggregation, MetricRenderingSettings } from '@exense/step-core';

export interface StandaloneChartAxesConfig {
  aggregation?: MetricAggregation;
  rateUnit?: 's' | 'm' | 'h';
  pclValue?: number;
  displayType?: AxesSettings['displayType'];
  unit?: string;
  renderingSettings?: MetricRenderingSettings;
  colorizationType?: AxesSettings['colorizationType'];
}

export interface StandaloneChartConfig {
  title?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  showYAxes?: boolean;
  showZAxes?: boolean;
  showTimeAxes?: boolean;
  showCursor?: boolean;
  tooltipYAxesUnit?: string;
  zoomEnabled?: boolean;
  primaryAxesUnit?: string;
  colorizationType?: 'STROKE' | 'FILL';
  primaryAxes?: StandaloneChartAxesConfig;
  secondaryAxes?: StandaloneChartAxesConfig | null;
  nullMeansZero?: boolean;
  resolution?: number;
  height?: number;
}
