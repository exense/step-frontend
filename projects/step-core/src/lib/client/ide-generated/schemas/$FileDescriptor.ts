/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FileDescriptor = {
  properties: {
    name: {
      type: 'string',
    },
    absolutePath: {
      type: 'string',
    },
    size: {
      type: 'number',
      format: 'int64',
    },
    isDirectory: {
      type: 'boolean',
    },
    isFile: {
      type: 'boolean',
    },
    isSymlink: {
      type: 'boolean',
    },
    isHidden: {
      type: 'boolean',
    },
  },
} as const;
