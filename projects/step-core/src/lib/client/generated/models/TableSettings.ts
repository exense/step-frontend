/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColumnSettings } from './ColumnSettings';

export type TableSettings = {
  customFields?: Record<string, any>;
  scope?: Record<string, string>;
  columnSettingList?: Array<ColumnSettings>;
  id?: string;
};
