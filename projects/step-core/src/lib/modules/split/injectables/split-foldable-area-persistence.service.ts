import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageProxy } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class SplitFoldableAreaPersistenceService extends StorageProxy {
  constructor(@Inject(LOCAL_STORAGE) _storage: Storage) {
    super(_storage, 'SPLIT_FOLDABLE_AREA_STATE');
  }
}
