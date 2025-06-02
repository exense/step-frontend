import { Inject, Injectable } from '@angular/core';
import { MEMORY_STORAGE, StorageProxy } from '../../basics/step-basics.module';

@Injectable()
export class TableMemoryStorageService extends StorageProxy {
  constructor(@Inject(MEMORY_STORAGE) memoryStorage: Storage) {
    super(memoryStorage, 'TABLES');
  }
}
