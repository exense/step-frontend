/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MeasurementsStats = {
  properties: {
    count: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    attributes: {
      type: 'array',
      contains: {
        type: 'string',
      },
      isRequired: true,
    },
    values: {
      type: 'dictionary',
      contains: {
        type: 'array',
        contains: {
          type: 'AttributeStats',
        },
      },
    },
  },
} as const;
