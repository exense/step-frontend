/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Selector = {
    properties: {
        textFilters: {
            type: 'array',
            contains: {
                type: 'TextFilter',
            },
        },
        numericalFilters: {
            type: 'array',
            contains: {
                type: 'NumericalFilter',
            },
        },
    },
} as const;
