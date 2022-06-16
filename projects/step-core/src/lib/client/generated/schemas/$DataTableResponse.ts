/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DataTableResponse = {
    properties: {
        draw: {
            type: 'number',
            format: 'int32',
        },
        recordsTotal: {
            type: 'number',
            format: 'int64',
        },
        recordsFiltered: {
            type: 'number',
            format: 'int64',
        },
        data: {
            type: 'array',
            contains: {
                type: 'array',
                contains: {
                    type: 'string',
                },
            },
        },
    },
} as const;
