/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DirectoryListing = {
  properties: {
    currentPath: {
      type: 'string',
    },
    parentPath: {
      type: 'string',
    },
    items: {
      type: 'array',
      contains: {
        type: 'FileDescriptor',
      },
    },
  },
} as const;
