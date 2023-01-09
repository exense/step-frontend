/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableBulkOperationRequest = {
  properties: {
    filters: {
      type: 'array',
      contains: {
        type: 'TableFilter',
      },
    },
    tableParameters: {
      type: 'TableParameters',
    },
    preview: {
      type: 'boolean',
    },
    targetType: {
      type: 'Enum',
    },
    ids: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
