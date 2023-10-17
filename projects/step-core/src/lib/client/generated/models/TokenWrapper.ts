/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AgentRef } from './AgentRef';
import type { Interest } from './Interest';
import type { Token } from './Token';
import type { TokenHealth } from './TokenHealth';
import type { TokenWrapperOwner } from './TokenWrapperOwner';

export type TokenWrapper = {
  token?: Token;
  agent?: AgentRef;
  tokenHealth?: TokenHealth;
  state?: 'FREE' | 'IN_USE' | 'ERROR' | 'MAINTENANCE_REQUESTED' | 'MAINTENANCE';
  currentOwner?: TokenWrapperOwner;
  interests?: Record<string, Interest>;
  attributes?: Record<string, string>;
};
