/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Recipient } from './Recipient';
import type { RepositoryObjectReference } from './RepositoryObjectReference';

export type NotificationSubscription = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    planReference?: RepositoryObjectReference;
    recipient?: Recipient;
    remoteCachedPlanName?: string;
    id?: string;
};

