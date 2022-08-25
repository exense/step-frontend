/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ExportStatus = {
  properties: {
    id: {
      type: 'string',
    },
    attachmentID: {
      type: 'string',
    },
    ready: {
      type: 'boolean',
    },
    progress: {
      type: 'number',
      format: 'float',
    },
    warnings: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
