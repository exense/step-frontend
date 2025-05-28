/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { Bucket } from './Bucket';
import type { Operation } from './Operation';
import type { ReportNode } from './ReportNode';

export type FlatAggregatedReportView = {
  artefact?: AbstractArtefact;
  artefactHash?: string;
  countByStatus?: Record<string, number>;
  singleInstanceReportNode?: ReportNode;
  bucketsByStatus?: Record<string, Bucket>;
  currentOperations?: Array<Operation>;
};
