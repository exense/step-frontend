/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AgentRef } from './AgentRef';
import type { TokenGroupCapacity } from './TokenGroupCapacity';
import type { TokenWrapper } from './TokenWrapper';

export type AgentListEntry = {
    agentRef?: AgentRef;
    tokens?: Array<TokenWrapper>;
    tokensCapacity?: TokenGroupCapacity;
};

