/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';

export type AggregatedReportView = {
  artefact?: AbstractArtefact;
  artefactHash?: string;
  countByStatus?: Record<string, number>;
  children?: Array<AggregatedReportView>;
  parentSource?: 'BEFORE' | 'BEFORE_THREAD' | 'MAIN' | 'SUB_PLAN' | 'AFTER_THREAD' | 'AFTER';
};
