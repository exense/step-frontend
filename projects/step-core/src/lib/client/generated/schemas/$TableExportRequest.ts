/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableExportRequest = {
    properties: {
        tableRequest: {
            type: 'TableRequest',
        },
        fields: {
            type: 'array',
            contains: {
                type: 'string',
            },
        },
    },
} as const;
