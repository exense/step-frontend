import { Inject, Injectable } from '@angular/core';
import { LogoutCleanup, SESSION_STORAGE, StorageProxy } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class MenuStorageService extends StorageProxy implements LogoutCleanup {
  constructor(@Inject(SESSION_STORAGE) storage: Storage) {
    super(storage, 'MENU');
  }

  logoutCleanup(): void {
    this.clearTokens();
  }
}
