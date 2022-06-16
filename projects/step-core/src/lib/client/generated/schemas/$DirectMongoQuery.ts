/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DirectMongoQuery = {
    properties: {
        host: {
            type: 'string',
        },
        user: {
            type: 'string',
        },
        port: {
            type: 'number',
            format: 'int32',
        },
        database: {
            type: 'string',
        },
        collection: {
            type: 'string',
        },
        query: {
            type: 'Filter',
        },
        projection: {
            type: 'string',
        },
        skip: {
            type: 'number',
            format: 'int32',
        },
        limit: {
            type: 'number',
            format: 'int32',
        },
        sort: {
            type: 'SearchOrder',
        },
    },
} as const;
