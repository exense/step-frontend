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
    reportType: {
      type: 'Enum',
    },
    layout: {
      type: 'dictionary',
      contains: {
        type: 'JsonValue',
      },
    },
  },
} as const;
