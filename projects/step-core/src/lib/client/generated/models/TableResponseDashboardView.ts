/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DashboardView } from './DashboardView';

export type TableResponseDashboardView = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<DashboardView>;
  hasNext?: boolean;
};
