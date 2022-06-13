/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RegistrationMessage = {
    properties: {
        agentRef: {
            type: 'AgentRef',
        },
        tokens: {
            type: 'array',
            contains: {
                type: 'Token',
            },
        },
    },
} as const;
