/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ScreenInput = {
    properties: {
        customFields: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        attributes: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        screenId: {
            type: 'string',
        },
        position: {
            type: 'number',
            format: 'int32',
        },
        input: {
            type: 'Input',
        },
        id: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
    },
} as const;
