/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TokenGroupCapacity = {
    properties: {
        key: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        countByState: {
            type: 'dictionary',
            contains: {
                type: 'number',
                format: 'int32',
            },
        },
        capacity: {
            type: 'number',
            format: 'int32',
        },
    },
} as const;
