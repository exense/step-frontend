/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ImportResult = {
  properties: {
    successful: {
      type: 'boolean',
    },
    planId: {
      type: 'string',
    },
    errors: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
