import { AbstractArtefact, DynamicValueInteger, DynamicValueString } from '@exense/step-core';

export interface ForArtefact extends AbstractArtefact {
  dataSource: {
    start: DynamicValueInteger;
    end: DynamicValueInteger;
    inc: DynamicValueInteger;
  };
  threads: DynamicValueInteger;
  maxFailedLoops: DynamicValueInteger;
  item: DynamicValueString;
  userItem: DynamicValueString;
  globalCounter: DynamicValueString;
}
