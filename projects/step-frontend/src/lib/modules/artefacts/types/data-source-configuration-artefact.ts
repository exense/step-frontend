import { AbstractArtefact } from '@exense/step-core';
import { DataSourceType } from './data-source-type.enum';
import { DataSourceConf } from './data-source-conf';

export interface DataSourceConfigurationArtefact extends AbstractArtefact {
  dataSourceType?: DataSourceType;
  dataSource?: DataSourceConf;
}
