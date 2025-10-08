/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { Bucket } from './Bucket';
import type { Operation } from './Operation';
import type { ReportNode } from './ReportNode';

export type AggregatedReportView = {
  artefact?: AbstractArtefact;
  artefactHash?: string;
  countByStatus?: Record<string, number>;
  countByErrorMessage?: Record<string, number>;
  countByContributingErrorMessage?: Record<string, number>;
  children?: Array<AggregatedReportView>;
  hasDescendantInvocations?: boolean;
  parentSource?: 'BEFORE' | 'BEFORE_THREAD' | 'MAIN' | 'SUB_PLAN' | 'AFTER_THREAD' | 'AFTER';
  singleInstanceReportNode?: ReportNode;
  bucketsByStatus?: Record<string, Bucket>;
  currentOperations?: Array<Operation>;
  countByChildrenErrorMessage?: Record<string, number>;
};
