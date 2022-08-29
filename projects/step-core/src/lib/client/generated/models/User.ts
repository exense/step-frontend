/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Preferences } from './Preferences';

export type User = {
  customFields?: Record<string, any>;
  username?: string;
  password?: string;
  role?: string;
  preferences?: Preferences;
  id?: string;
};
