/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileDescriptor } from './FileDescriptor';

export type DirectoryListing = {
  path?: string;
  parentPath?: string;
  resourceReference?: string;
  entries?: Array<FileDescriptor>;
};
