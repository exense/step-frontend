/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AgentRef } from './AgentRef';
import type { Token } from './Token';

export type RegistrationMessage = {
    agentRef?: AgentRef;
    tokens?: Array<Token>;
};

