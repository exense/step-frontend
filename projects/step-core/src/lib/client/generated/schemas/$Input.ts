/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Input = {
    properties: {
        id: {
            type: 'string',
        },
        options: {
            type: 'array',
            contains: {
                type: 'Option',
            },
        },
        activationExpression: {
            type: 'Expression',
        },
        priority: {
            type: 'number',
            format: 'int32',
        },
        type: {
            type: 'Enum',
        },
        label: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        valueHtmlTemplate: {
            type: 'string',
        },
        searchMapperService: {
            type: 'string',
        },
        defaultValue: {
            type: 'string',
        },
    },
} as const;
