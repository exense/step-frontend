/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChartFilterItem = {
  properties: {
    attribute: {
      type: 'string',
    },
    type: {
      type: 'Enum',
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
    exactMatch: {
      type: 'boolean',
    },
  },
} as const;
