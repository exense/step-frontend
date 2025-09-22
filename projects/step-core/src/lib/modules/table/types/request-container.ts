import { StepDataSourceReloadOptions } from '../../../client/table';

export interface RequestContainer<T> extends StepDataSourceReloadOptions {
  request?: T;
}
