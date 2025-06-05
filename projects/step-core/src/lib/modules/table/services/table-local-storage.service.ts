import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageProxy } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class TableLocalStorageService extends StorageProxy {
  constructor(@Inject(LOCAL_STORAGE) localStorage: Storage) {
    super(localStorage, 'TABLES');
  }
}
