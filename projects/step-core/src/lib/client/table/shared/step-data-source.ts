import { DataSource } from '@angular/cdk/collections';

export interface StepDataSourceReloadOptions {
  hideProgress?: boolean;
  immediateHideProgress?: boolean;
  isForce?: boolean;
}

export interface StepDataSource<T> extends DataSource<T> {
  reload(reloadOptions?: StepDataSourceReloadOptions): void;
  skipOngoingRequest(): void;
}
