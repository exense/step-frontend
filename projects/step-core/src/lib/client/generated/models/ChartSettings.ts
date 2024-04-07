/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AxesSettings } from './AxesSettings';
import type { MetricAttribute } from './MetricAttribute';
import type { TimeSeriesFilterItem } from './TimeSeriesFilterItem';

export type ChartSettings = {
  attributes: Array<MetricAttribute>;
  primaryAxes: AxesSettings;
  secondaryAxes?: AxesSettings;
  readonlyGrouping: boolean;
  readonlyAggregate: boolean;
};
