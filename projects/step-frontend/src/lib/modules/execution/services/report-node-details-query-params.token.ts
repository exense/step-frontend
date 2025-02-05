import { InjectionToken } from '@angular/core';

export interface ReportNodeDetailsQueryParams {
  reportNodeId: string;
  aggregatedNodeId: string;
  searchStatus: string;
}

export const REPORT_NODE_DETAILS_QUERY_PARAMS = new InjectionToken<ReportNodeDetailsQueryParams>(
  'Report node details query params',
  {
    providedIn: 'root',
    factory: () =>
      ({
        reportNodeId: 'reportNodeId',
        aggregatedNodeId: 'aggregatedNodeId',
        searchStatus: 'searchStatus',
      }) as ReportNodeDetailsQueryParams,
  },
);
