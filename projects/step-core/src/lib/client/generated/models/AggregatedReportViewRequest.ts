/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Range } from './Range';

export type AggregatedReportViewRequest = {
  range?: Range;
  resolveSingleInstanceReport?: boolean;
  selectedReportNodeId?: string;
  filterResolvedPlanNodes?: boolean;
  filterArtefactClasses?: Array<string>;
  fetchCurrentOperations?: boolean;
};
