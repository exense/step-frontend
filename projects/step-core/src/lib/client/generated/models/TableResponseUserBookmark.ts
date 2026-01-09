/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserBookmark } from './UserBookmark';

export type TableResponseUserBookmark = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<UserBookmark>;
  hasNext?: boolean;
};
