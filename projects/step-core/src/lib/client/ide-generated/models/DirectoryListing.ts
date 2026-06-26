/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileDescriptor } from './FileDescriptor';

export type DirectoryListing = {
  currentPath?: string;
  parentPath?: string;
  items?: Array<FileDescriptor>;
};
