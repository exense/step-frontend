/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AxesSettings = {
  properties: {
    aggregation: {
      type: 'Enum',
      isRequired: true,
    },
    pclValue: {
      type: 'number',
      format: 'double',
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
