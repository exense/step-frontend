import { Inject, Injectable } from '@angular/core';
import { StorageProxy, SESSION_STORAGE, LogoutCleanup } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class TableStorageService extends StorageProxy implements LogoutCleanup {
  constructor(@Inject(SESSION_STORAGE) storage: Storage) {
    super(storage, 'TABLES');
  }

  logoutCleanup(): void {
    this.clearTokens();
  }
}
