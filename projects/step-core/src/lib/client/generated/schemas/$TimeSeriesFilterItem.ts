/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeSeriesFilterItem = {
  properties: {
    label: {
      type: 'string',
    },
    attribute: {
      type: 'string',
      isRequired: true,
    },
    type: {
      type: 'Enum',
      isRequired: true,
    },
    exactMatch: {
      type: 'boolean',
      isRequired: true,
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
