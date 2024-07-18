/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AxesSettings = {
  properties: {
    aggregation: {
      type: 'MetricAggregation',
      isRequired: true,
    },
    displayType: {
      type: 'Enum',
      isRequired: true,
    },
    unit: {
      type: 'string',
      isRequired: true,
    },
    renderingSettings: {
      type: 'MetricRenderingSettings',
    },
    colorizationType: {
      type: 'Enum',
      isRequired: true,
    },
  },
} as const;
