import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageProxy } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class HeatmapStorageService extends StorageProxy {
  constructor(@Inject(SESSION_STORAGE) storage: Storage) {
    super(storage, 'HEATMAP');
  }
}
