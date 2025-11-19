/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Measure = {
  properties: {
    name: {
      type: 'string',
    },
    duration: {
      type: 'number',
      format: 'int64',
    },
    begin: {
      type: 'number',
      format: 'int64',
    },
    status: {
      type: 'Enum',
    },
    data: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
  },
} as const;
