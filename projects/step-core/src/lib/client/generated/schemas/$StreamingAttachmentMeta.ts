/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $StreamingAttachmentMeta = {
  type: 'all-of',
  contains: [
    {
      type: 'AttachmentMeta',
    },
    {
      properties: {
        mimeType: {
          type: 'string',
        },
        currentSize: {
          type: 'number',
          format: 'int64',
        },
        status: {
          type: 'Enum',
        },
      },
    },
  ],
} as const;
