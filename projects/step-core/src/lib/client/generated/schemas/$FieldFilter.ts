/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FieldFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'TableFilter',
    },
    {
      properties: {
        field: {
          type: 'string',
        },
        value: {
          type: 'string',
        },
        regex: {
          type: 'boolean',
        },
      },
    },
  ],
} as const;
