/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MediaType = {
  properties: {
    type: {
      type: 'string',
    },
    subtype: {
      type: 'string',
    },
    parameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    wildcardSubtype: {
      type: 'boolean',
    },
    wildcardType: {
      type: 'boolean',
    },
  },
} as const;
