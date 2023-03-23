import { Inject, Injectable } from '@angular/core';
import { STORAGE } from '../shared/storage.token';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService implements Storage {
  constructor(@Inject(STORAGE) private storage: Storage) {}

  get length(): number {
    return this.storage.length;
  }

  clear(): void {
    this.storage.clear();
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  key(index: number): string | null {
    return this.storage.key(index);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }
}
