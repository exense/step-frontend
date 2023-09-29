/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { DynamicValueBoolean } from './DynamicValueBoolean';
import type { DynamicValueString } from './DynamicValueString';

export type CallPlan = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  dynamicName?: DynamicValueString;
  useDynamicName?: boolean;
  description?: string;
  children?: Array<AbstractArtefact>;
  customAttributes?: Record<string, any>;
  attachments?: Array<string>;
  skipNode?: DynamicValueBoolean;
  instrumentNode?: DynamicValueBoolean;
  continueParentNodeExecutionOnError?: DynamicValueBoolean;
  planId?: string;
  selectionAttributes?: DynamicValueString;
  input?: DynamicValueString;
  id?: string;
};
