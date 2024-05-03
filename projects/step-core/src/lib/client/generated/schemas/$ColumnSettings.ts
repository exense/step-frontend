/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ColumnSettings = {
  properties: {
    columnId: {
      type: 'string',
    },
    visible: {
      type: 'boolean',
    },
    position: {
      type: 'number',
      format: 'int32',
    },
    type: {
      type: 'string',
      isRequired: true,
    },
  },
} as const;
