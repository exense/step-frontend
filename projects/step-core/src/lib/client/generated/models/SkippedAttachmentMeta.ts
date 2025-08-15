/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AttachmentMeta } from './AttachmentMeta';

export type SkippedAttachmentMeta = AttachmentMeta & {
  reason?: string;
};
