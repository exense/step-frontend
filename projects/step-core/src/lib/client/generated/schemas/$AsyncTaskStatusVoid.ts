/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AsyncTaskStatusVoid = {
  properties: {
    id: {
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
    error: {
      type: 'string',
    },
    result: {
      properties: {},
    },
  },
} as const;
