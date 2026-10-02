/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { ChildrenBlock } from './ChildrenBlock';
import type { DynamicValueBoolean } from './DynamicValueBoolean';
import type { DynamicValueString } from './DynamicValueString';

export type CallFunction = {
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
  attributes?: Record<string, string>;
  dynamicName?: DynamicValueString;
  useDynamicName?: boolean;
  description?: string;
  customAttributes?: Record<string, any>;
  attachments?: Array<string>;
  skipNode?: DynamicValueBoolean;
  instrumentNode?: DynamicValueBoolean;
  continueParentNodeExecutionOnError?: DynamicValueBoolean;
  before?: ChildrenBlock;
  children?: Array<AbstractArtefact>;
  after?: ChildrenBlock;
  remote?: DynamicValueBoolean;
  token?: DynamicValueString;
  function?: DynamicValueString;
  argument?: DynamicValueString;
  resultMap?: DynamicValueString;
  workArtefact?: boolean;
  id?: string;
};
