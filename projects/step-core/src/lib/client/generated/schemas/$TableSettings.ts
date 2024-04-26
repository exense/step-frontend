/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableSettings = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    settingId: {
      type: 'string',
    },
    scope: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    columnSettingList: {
      type: 'array',
      contains: {
        type: 'ColumnSettings',
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    columns: {
      type: 'array',
      contains: {
        type: 'ColumnSelection',
      },
      isRequired: true,
    },
  },
} as const;
