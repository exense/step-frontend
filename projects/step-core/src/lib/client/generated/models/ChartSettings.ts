/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AxesSettings } from './AxesSettings';
import type { ChartFilterItem } from './ChartFilterItem';

export type ChartSettings = {
  primaryAxes?: AxesSettings;
  secondaryAxes?: AxesSettings;
  grouping?: Array<string>;
  inheritGlobalFilters?: boolean;
  inheritGlobalGrouping?: boolean;
  filters?: Array<ChartFilterItem>;
};
