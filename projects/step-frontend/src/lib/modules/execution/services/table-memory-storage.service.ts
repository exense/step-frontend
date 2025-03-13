import { Inject, Injectable } from '@angular/core';
import { MEMORY_STORAGE, StorageProxy } from '@exense/step-core';

@Injectable()
export class TableMemoryStorageService extends StorageProxy {
  constructor(@Inject(MEMORY_STORAGE) memoryStorage: Storage) {
    super(memoryStorage, 'TABLES');
  }
}
