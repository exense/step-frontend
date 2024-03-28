/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableSettingsRequest = {
  properties: {
    tableSettings: {
      type: 'TableSettings',
    },
    scope: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
