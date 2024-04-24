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
      format: 'int32',
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
  },
} as const;
