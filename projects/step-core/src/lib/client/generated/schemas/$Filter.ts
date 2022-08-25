/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Filter = {
  properties: {
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
