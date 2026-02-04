import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageProxy } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class GridSessionStorageService extends StorageProxy {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(@Inject(SESSION_STORAGE) _sessionStorage: Storage) {
    super(_sessionStorage, 'GRID');
  }
}
