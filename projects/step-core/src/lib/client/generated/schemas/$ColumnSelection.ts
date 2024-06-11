/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ColumnSelection = {
  properties: {
    column: {
      type: 'Enum',
      isRequired: true,
    },
    pclValue: {
      type: 'number',
      format: 'int32',
    },
    selected: {
      type: 'boolean',
    },
  },
} as const;
