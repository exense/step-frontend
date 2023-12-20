/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DashboardItem = {
  properties: {
    name: {
      type: 'string',
      isRequired: true,
    },
    type: {
      type: 'Enum',
      isRequired: true,
    },
    chartSettings: {
      type: 'ChartSettings',
    },
    size: {
      type: 'number',
      isRequired: true,
      format: 'int32',
    },
  },
} as const;
