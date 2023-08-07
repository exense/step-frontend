import { DataSource } from '@angular/cdk/collections';

export interface StepDataSource<T> extends DataSource<T> {
  reload(reloadOptions?: { hideProgress: boolean }): void;
  skipOngoingRequest(): void;
}
