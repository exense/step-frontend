/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $NumericalFilter = {
    properties: {
        key: {
            type: 'string',
        },
        minValue: {
            type: 'number',
            format: 'int64',
        },
        maxValue: {
            type: 'number',
            format: 'int64',
        },
    },
} as const;
