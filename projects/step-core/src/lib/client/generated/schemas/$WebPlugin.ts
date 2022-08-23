/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $WebPlugin = {
  properties: {
    scripts: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    angularModules: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
