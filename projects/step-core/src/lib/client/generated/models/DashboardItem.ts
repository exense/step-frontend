/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChartSettings } from './ChartSettings';

export type DashboardItem = {
  name: string;
  type: 'CHART' | 'TABLE' | 'PIE_CHART';
  chartSettings?: ChartSettings;
  size: number;
};
