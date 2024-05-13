/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableBulkOperationReport = {
  properties: {
    count: {
      type: 'number',
      format: 'int64',
    },
    skipped: {
      type: 'number',
      format: 'int64',
    },
    failed: {
      type: 'number',
      format: 'int64',
    },
    warnings: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    errors: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
