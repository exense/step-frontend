/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FunctionInputJsonObject = {
    properties: {
        payload: {
            type: 'dictionary',
            contains: {
                type: 'JsonValue',
            },
        },
        properties: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
    },
} as const;
