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
  executionTime?: number;
  duration?: number;
  attachments?: Array<AttachmentMeta>;
  status?: 'TECHNICAL_ERROR' | 'FAILED' | 'PASSED' | 'INTERRUPTED' | 'SKIPPED' | 'NORUN' | 'RUNNING';
  error?: Error;
  customAttributes?: Record<string, string>;
  resolvedArtefact?: AbstractArtefact;
  orphan?: boolean;
  id?: string;
  _class: string;
};
