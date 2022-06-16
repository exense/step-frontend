/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $User = {
    properties: {
        customFields: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
        role: {
            type: 'string',
        },
        preferences: {
            type: 'Preferences',
        },
        id: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
    },
} as const;
