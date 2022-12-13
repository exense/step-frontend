/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BulkOperationParameters = {
  properties: {
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
    filters: {
      type: 'array',
      contains: {
        type: 'TableFilter',
      },
    },
  },
} as const;
