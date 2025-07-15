/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AttachmentMeta } from './AttachmentMeta';

export type StreamingAttachmentMeta = AttachmentMeta & {
  mimeType?: string;
  currentSize?: number;
  status?: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
};
