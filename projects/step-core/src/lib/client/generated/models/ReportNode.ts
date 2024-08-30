/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { AttachmentMeta } from './AttachmentMeta';
import type { Error } from './Error';

export type ReportNode = {
  customFields?: Record<string, any>;
  parentID?: string;
  name?: string;
  executionID?: string;
  artefactID?: string;
  artefactHash?: string;
  executionTime?: number;
  duration?: number;
  attachments?: Array<AttachmentMeta>;
  status?:
    | 'VETOED'
    | 'IMPORT_ERROR'
    | 'TECHNICAL_ERROR'
    | 'FAILED'
    | 'INTERRUPTED'
    | 'PASSED'
    | 'SKIPPED'
    | 'NORUN'
    | 'RUNNING';
  error?: Error;
  customAttributes?: Record<string, string>;
  resolvedArtefact?: AbstractArtefact;
  contributingError?: boolean;
  orphan?: boolean;
  id?: string;
  _class: string;
};
