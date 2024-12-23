import { AbstractArtefact, type ChildrenBlock, DynamicValueInteger, DynamicValueString } from '@exense/step-core';

export interface ThreadGroupArtefact extends AbstractArtefact {
  users: DynamicValueInteger;
  pacing: DynamicValueInteger;
  rampup: DynamicValueInteger;
  pack: DynamicValueInteger;
  startOffset: DynamicValueInteger;
  iterations: DynamicValueInteger;
  maxDuration: DynamicValueInteger;
  localItem: DynamicValueString;
  userItem: DynamicValueString;
  item: DynamicValueString;
  beforeThread?: ChildrenBlock;
  afterThread?: ChildrenBlock;
}
