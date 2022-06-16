/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SelectTokenArgument = {
    properties: {
        attributes: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        interests: {
            type: 'dictionary',
            contains: {
                type: 'Interest',
            },
        },
        matchTimeout: {
            type: 'number',
            format: 'int64',
        },
        noMatchTimeout: {
            type: 'number',
            format: 'int64',
        },
        tokenOwner: {
            type: 'TokenWrapperOwner',
        },
    },
} as const;
