/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DockerRegistryConfiguration = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    url: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
