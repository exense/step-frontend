/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { JsonValue } from './JsonValue';

export type ReportLayoutJson = {
  id?: string;
  name?: string;
  layout?: Record<string, JsonValue>;
};
