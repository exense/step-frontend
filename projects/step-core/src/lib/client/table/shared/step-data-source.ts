import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

export interface StepDataSourceReloadOptions {
  hideProgress?: boolean;
  immediateHideProgress?: boolean;
  isForce?: boolean;
}

export interface StepDataSource<T> extends DataSource<T> {
  reload(reloadOptions?: StepDataSourceReloadOptions): void;
  skipOngoingRequest(): void;
  connect(collectionViewer?: CollectionViewer): Observable<readonly T[]>;
  disconnect(collectionViewer?: CollectionViewer): void;
}
