/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AgentPoolProvisioningConfiguration = {
  properties: {
    replicas: {
      type: 'number',
      format: 'int32',
    },
    pool: {
      type: 'string',
    },
    image: {
      type: 'string',
    },
  },
} as const;
