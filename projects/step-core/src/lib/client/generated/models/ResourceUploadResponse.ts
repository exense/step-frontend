/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Resource } from './Resource';

export type ResourceUploadResponse = {
  resource?: Resource;
  similarResources?: Array<Resource>;
};
