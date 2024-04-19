/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableDashletSettings = {
  properties: {
    columns: {
      type: 'array',
      contains: {
        type: 'ColumnSelection',
      },
      isRequired: true,
    },
  },
} as const;
