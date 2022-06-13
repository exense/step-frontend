/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AgentListEntry = {
    properties: {
        agentRef: {
            type: 'AgentRef',
        },
        tokens: {
            type: 'array',
            contains: {
                type: 'TokenWrapper',
            },
        },
        tokensCapacity: {
            type: 'TokenGroupCapacity',
        },
    },
} as const;
