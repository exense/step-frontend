/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $OQLFilter = {
    type: 'all-of',
    contains: [{
        type: 'TableFilter',
    }, {
        properties: {
            oql: {
                type: 'string',
            },
        },
    }],
} as const;
