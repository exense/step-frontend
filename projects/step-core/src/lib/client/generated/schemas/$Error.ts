/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Error = {
    properties: {
        type: {
            type: 'Enum',
        },
        layer: {
            type: 'string',
        },
        msg: {
            type: 'string',
        },
        code: {
            type: 'number',
            format: 'int32',
        },
        root: {
            type: 'boolean',
        },
    },
} as const;
