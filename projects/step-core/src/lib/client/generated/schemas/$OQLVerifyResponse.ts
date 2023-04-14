/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $OQLVerifyResponse = {
  properties: {
    fields: {
      type: 'array',
      contains: {
        type: 'string',
      },
      isRequired: true,
    },
    valid: {
      type: 'boolean',
      isRequired: true,
    },
    hasUnknownFields: {
      type: 'boolean',
      isRequired: true,
    },
  },
} as const;
