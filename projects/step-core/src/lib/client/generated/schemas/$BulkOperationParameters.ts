/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BulkOperationParameters = {
    properties: {
        simulate: {
            type: 'boolean',
        },
        targetType: {
            type: 'Enum',
        },
        ids: {
            type: 'array',
            contains: {
                type: 'string',
            },
        },
        filter: {
            type: 'TableFilter',
        },
    },
} as const;
