import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageProxy } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class HeatmapSessionStorageService extends StorageProxy {
  constructor(@Inject(LOCAL_STORAGE) storage: Storage) {
    super(storage, 'HEATMAP');
  }
}
