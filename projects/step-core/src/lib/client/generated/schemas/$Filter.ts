/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Filter = {
  properties: {
    field: {
      type: 'string',
    },
    children: {
      type: 'array',
      contains: {
        type: 'Filter',
      },
    },
    type: {
      type: 'string',
      isRequired: true,
    },
  },
} as const;
