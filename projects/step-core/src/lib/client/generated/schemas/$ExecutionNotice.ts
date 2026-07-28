/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ExecutionNotice = {
  properties: {
    typeId: {
      type: 'string',
    },
    parameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    timestamp: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;
