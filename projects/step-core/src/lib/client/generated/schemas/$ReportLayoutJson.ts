/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ReportLayoutJson = {
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    layout: {
      type: 'dictionary',
      contains: {
        type: 'JsonValue',
      },
    },
  },
} as const;
