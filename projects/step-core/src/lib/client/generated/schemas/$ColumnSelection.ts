/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ColumnSelection = {
  properties: {
    column: {
      type: 'Enum',
      isRequired: true,
    },
    selected: {
      type: 'boolean',
    },
    type: {
      type: 'string',
      isRequired: true,
    },
  },
} as const;
