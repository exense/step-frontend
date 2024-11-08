import { DynamicValueInteger, DynamicValueString } from '@exense/step-core';
import { DataSourceConfigurationArtefact } from './data-source-configuration-artefact';

export interface ForEachArtefact extends DataSourceConfigurationArtefact {
  threads: DynamicValueInteger;
  maxFailedLoops: DynamicValueInteger;
  item: DynamicValueString;
  userItem: DynamicValueString;
  globalCounter: DynamicValueString;
}
