/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChartSettings } from './ChartSettings';
import type { TableSettings } from './TableSettings';

export type DashboardItem = {
  name: string;
  type: 'CHART' | 'TABLE' | 'PIE_CHART';
  chartSettings?: ChartSettings;
  tableSettings?: TableSettings;
  size: number;
  syncKey?: string;
};
