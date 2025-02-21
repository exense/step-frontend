/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChildrenBlock } from './ChildrenBlock';
import type { DynamicValueBoolean } from './DynamicValueBoolean';
import type { DynamicValueString } from './DynamicValueString';

export type AbstractArtefact = {
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
  before?: ChildrenBlock;
  after?: ChildrenBlock;
  workArtefact?: boolean;
  id?: string;
  _class: string;
};
