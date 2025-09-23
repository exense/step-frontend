import { DataPoolConfiguration, DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '@exense/step-core';

export interface DataSourceConf extends DataPoolConfiguration {
  file: DynamicValueString;
  delimiter: DynamicValueString;

  worksheet: DynamicValueString;
  headers: DynamicValueBoolean;

  connectionString: DynamicValueString;
  driverClass: DynamicValueString;
  query: DynamicValueString;
  user: DynamicValueString;
  password: DynamicValueString;
  writePKey: DynamicValueString;

  serviceAccountKey: DynamicValueString;
  fileId: DynamicValueString;
  tabName: DynamicValueString;

  start: DynamicValueInteger;
  end: DynamicValueInteger;
  inc: DynamicValueInteger;

  json: DynamicValueString;

  folder: DynamicValueString;

  protect: DynamicValueBoolean;
}
