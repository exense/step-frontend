/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ProxiedRequest = {
    properties: {
        url: {
            type: 'string',
        },
        method: {
            type: 'string',
        },
        data: {
            type: 'string',
        },
        headers: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
    },
} as const;
