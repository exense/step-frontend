/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AutomaticAgentProvisioningConfiguration = {
  type: 'all-of',
  contains: [
    {
      type: 'AgentProvisioningConfiguration',
    },
    {
      properties: {
        mode: {
          type: 'Enum',
        },
      },
    },
  ],
} as const;
