/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { DynamicValueBoolean } from './DynamicValueBoolean';
import type { DynamicValueString } from './DynamicValueString';

export type CallFunction = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    dynamicName?: DynamicValueString;
    useDynamicName?: boolean;
    description?: string;
    children?: Array<AbstractArtefact>;
    customAttributes?: Record<string, any>;
    attachments?: Array<string>;
    persistNode?: boolean;
    skipNode?: DynamicValueBoolean;
    instrumentNode?: DynamicValueBoolean;
    continueParentNodeExecutionOnError?: DynamicValueBoolean;
    remote?: DynamicValueBoolean;
    token?: DynamicValueString;
    function?: DynamicValueString;
    argument?: DynamicValueString;
    resultMap?: DynamicValueString;
    id?: string;
};

