/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChartSettings = {
  properties: {
    primaryAxes: {
      type: 'AxesSettings',
    },
    secondaryAxes: {
      type: 'AxesSettings',
    },
    grouping: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    inheritGlobalFilters: {
      type: 'boolean',
    },
    inheritGlobalGrouping: {
      type: 'boolean',
    },
    filters: {
      type: 'array',
      contains: {
        type: 'ChartFilterItem',
      },
    },
  },
} as const;
