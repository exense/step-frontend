/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { JsonValue } from './JsonValue';

export type ReportLayout = {
  layout?: Record<string, JsonValue>;
  visibility?: 'Preset' | 'Private' | 'Shared';
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  creationDate?: string;
  creationUser?: string;
  lastModificationDate?: string;
  lastModificationUser?: string;
  id?: string;
};
