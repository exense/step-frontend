/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ManualAgentProvisioningConfiguration = {
  type: 'all-of',
  contains: [
    {
      type: 'AgentProvisioningConfiguration',
    },
    {
      properties: {
        configuredAgentPools: {
          type: 'array',
          contains: {
            type: 'AgentPoolProvisioningConfiguration',
          },
        },
      },
    },
  ],
} as const;
