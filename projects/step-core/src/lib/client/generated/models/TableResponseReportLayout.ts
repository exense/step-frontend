/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ReportLayout } from './ReportLayout';

export type TableResponseReportLayout = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<ReportLayout>;
  hasNext?: boolean;
};
