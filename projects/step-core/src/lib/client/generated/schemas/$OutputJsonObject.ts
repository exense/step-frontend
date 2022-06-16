/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $OutputJsonObject = {
    properties: {
        payload: {
            type: 'dictionary',
            contains: {
                type: 'JsonValue',
            },
        },
        error: {
            type: 'Error',
        },
        attachments: {
            type: 'array',
            contains: {
                type: 'Attachment',
            },
        },
        measures: {
            type: 'array',
            contains: {
                type: 'Measure',
            },
        },
    },
} as const;
