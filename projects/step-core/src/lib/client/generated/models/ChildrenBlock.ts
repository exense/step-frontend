/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { DynamicValueBoolean } from './DynamicValueBoolean';

export type ChildrenBlock = {
  continueOnError?: DynamicValueBoolean;
  steps?: Array<AbstractArtefact>;
};
