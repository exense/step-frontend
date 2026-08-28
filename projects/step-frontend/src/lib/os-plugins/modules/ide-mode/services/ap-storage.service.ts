import {inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageProxy} from '@exense/step-core';

@Injectable({
  providedIn: 'root'
})
export class ApStorageService extends StorageProxy {
  constructor() {
    super(inject(LOCAL_STORAGE), 'IDE_AP_STORAGE');
  }
}
