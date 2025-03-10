/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ApplicationConfiguration = {
  properties: {
    authentication: {
      type: 'boolean',
    },
    authenticatorName: {
      type: 'string',
    },
    demo: {
      type: 'boolean',
    },
    debug: {
      type: 'boolean',
    },
    noLoginMask: {
      type: 'boolean',
    },
    passwordManagement: {
      type: 'boolean',
    },
    userManagement: {
      type: 'boolean',
    },
    roleManagement: {
      type: 'boolean',
    },
    projectMembershipManagement: {
      type: 'boolean',
    },
    roles: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    miscParams: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    defaultUrl: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    forceLegacyReporting: {
      type: 'boolean',
    },
  },
} as const;
