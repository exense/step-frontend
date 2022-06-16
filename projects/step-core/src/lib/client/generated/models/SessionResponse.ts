/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Role } from './Role';

export type SessionResponse = {
    username?: string;
    role?: Role;
    otp?: boolean;
};

