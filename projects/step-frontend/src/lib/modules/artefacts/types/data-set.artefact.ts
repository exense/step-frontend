import { DynamicValueBoolean, DynamicValueString } from '@exense/step-core';
import { DataSourceConf } from './data-source-conf';
import { DataSourceConfigurationArtefact } from './data-source-configuration-artefact';

export interface DataSetDataSource extends DataSourceConf {
  forWrite: DynamicValueBoolean;
}

export interface DataSetArtefact extends DataSourceConfigurationArtefact {
  dataSource?: DataSetDataSource;
  item: DynamicValueString;
  resetAtEnd: DynamicValueBoolean;
}
