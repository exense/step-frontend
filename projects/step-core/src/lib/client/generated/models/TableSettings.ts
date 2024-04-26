/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColumnSettings } from './ColumnSettings';
import type { ColumnSelection } from './ColumnSelection';

export type TableSettings = {
  customFields?: Record<string, any>;
  settingId?: string;
  scope?: Record<string, string>;
  columnSettingList?: Array<ColumnSettings>;
  columns: Array<ColumnSelection>;
  id?: string;
};
