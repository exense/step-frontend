/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Interest } from './Interest';

export type GetTokenHandleParameter = {
  attributes?: Record<string, string>;
  interests?: Record<string, Interest>;
  createSession?: boolean;
  local?: boolean;
  reservationDescription?: string;
  skipAutoProvisioning?: boolean;
};
