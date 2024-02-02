import { Inject, Injectable } from '@angular/core';
import { StorageProxy, MEMORY_STORAGE } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class TableStorageService extends StorageProxy {
  constructor(@Inject(MEMORY_STORAGE) storage: Storage) {
    super(storage, 'TABLES');
  }
}
