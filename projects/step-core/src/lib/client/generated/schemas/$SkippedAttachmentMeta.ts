/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SkippedAttachmentMeta = {
  type: 'all-of',
  contains: [
    {
      type: 'AttachmentMeta',
    },
    {
      properties: {
        reason: {
          type: 'string',
        },
      },
    },
  ],
} as const;
