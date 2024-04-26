/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColumnSettings } from './ColumnSettings';

export type TableSettings = {
  customFields?: Record<string, any>;
  settingId?: string;
  scope?: Record<string, string>;
  columnSettingList?: Array<ColumnSettings>;
  id?: string;
};
