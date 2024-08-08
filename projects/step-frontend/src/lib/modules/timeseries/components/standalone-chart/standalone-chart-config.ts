import { Input } from '@angular/core';

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
  resolution?: number;
  height?: number;
}
