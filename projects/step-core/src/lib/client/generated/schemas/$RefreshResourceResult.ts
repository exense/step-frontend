/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RefreshResourceResult = {
  properties: {
    resultStatus: {
      type: 'Enum',
    },
    errorMessages: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    infoMessages: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    failed: {
      type: 'boolean',
    },
  },
} as const;
