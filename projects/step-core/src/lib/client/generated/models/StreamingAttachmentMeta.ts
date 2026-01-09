/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AttachmentMeta } from './AttachmentMeta';

export type StreamingAttachmentMeta = AttachmentMeta & {
  currentSize?: number;
  currentNumberOfLines?: number;
  status?: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
};
