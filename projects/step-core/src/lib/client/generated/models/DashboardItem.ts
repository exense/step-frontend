/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChartSettings } from './ChartSettings';
import type { TableSettings } from './TableSettings';

export type DashboardItem = {
  id: string;
  name: string;
  type: 'CHART' | 'TABLE' | 'PIE_CHART';
  chartSettings?: ChartSettings;
  tableSettings?: TableSettings;
  size: number;
  masterChartId?: string;
};
