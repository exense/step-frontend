/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ProposeDirectoryResponse = {
  properties: {
    directory: {
      type: 'string',
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
