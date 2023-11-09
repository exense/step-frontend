/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseDockerRegistryConfiguration = {
  properties: {
    recordsTotal: {
      type: 'number',
      format: 'int64',
    },
    recordsFiltered: {
      type: 'number',
      format: 'int64',
    },
    data: {
      type: 'array',
      contains: {
        type: 'DockerRegistryConfiguration',
      },
    },
  },
} as const;
