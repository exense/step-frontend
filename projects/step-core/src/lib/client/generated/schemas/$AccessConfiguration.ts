/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AccessConfiguration = {
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
        displayLegacyPerfDashboard: {
            type: 'boolean',
        },
        displayNewPerfDashboard: {
            type: 'boolean',
        },
    },
} as const;
