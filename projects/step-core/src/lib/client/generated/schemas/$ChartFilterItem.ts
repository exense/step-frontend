/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChartFilterItem = {
  properties: {
    label: {
      type: 'string',
    },
    attribute: {
      type: 'string',
    },
    type: {
      type: 'Enum',
    },
    exactMatch: {
      type: 'boolean',
    },
    min: {
      type: 'number',
      format: 'int64',
    },
    max: {
      type: 'number',
      format: 'int64',
    },
    textValues: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    textOptions: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    removable: {
      type: 'boolean',
    },
  },
} as const;
