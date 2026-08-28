/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DirectoryListing = {
  properties: {
    path: {
      type: 'string',
    },
    parentPath: {
      type: 'string',
    },
    resourceReference: {
      type: 'string',
    },
    entries: {
      type: 'array',
      contains: {
        type: 'FileDescriptor',
      },
    },
  },
} as const;
