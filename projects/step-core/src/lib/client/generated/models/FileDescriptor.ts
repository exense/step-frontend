/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FileDescriptor = {
  name?: string;
  path?: string;
  directory?: boolean;
  regularFile?: boolean;
  hidden?: boolean;
  symlink?: boolean;
  size?: number;
  resourceReference?: string;
};
