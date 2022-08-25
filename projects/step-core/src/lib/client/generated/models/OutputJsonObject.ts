/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Attachment } from './Attachment';
import type { Error } from './Error';
import type { JsonValue } from './JsonValue';
import type { Measure } from './Measure';

export type OutputJsonObject = {
  payload?: Record<string, JsonValue>;
  error?: Error;
  attachments?: Array<Attachment>;
  measures?: Array<Measure>;
};
