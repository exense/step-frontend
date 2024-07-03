/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PclColumnSelection = {
  type: 'all-of',
  contains: [
    {
      type: 'ColumnSelection',
    },
    {
      properties: {
        pclValue: {
          type: 'number',
          format: 'double',
        },
      },
    },
    {
      properties: {
        pclValue: {
          type: 'number',
          isRequired: true,
          format: 'double',
        },
      },
    },
  ],
} as const;
