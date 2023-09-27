/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricType = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    label: {
      type: 'string',
    },
    oqlQuery: {
      type: 'string',
    },
    renderSettings: {
      type: 'MetricTypeRenderSettings',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
