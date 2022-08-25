/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ViewModel = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    viewId: {
      type: 'string',
    },
    executionId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    _class: {
      type: 'string',
      isRequired: true,
    },
  },
} as const;
