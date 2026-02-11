import { inject, Injectable } from '@angular/core';
import { SESSION_STORAGE, StorageProxy } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class GridSessionStorageService extends StorageProxy {
  constructor() {
    super(inject(SESSION_STORAGE), 'GRID');
  }
}
