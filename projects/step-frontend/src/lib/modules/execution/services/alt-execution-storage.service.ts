import { inject, Injectable } from '@angular/core';
import { MEMORY_STORAGE } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class AltExecutionStorageService implements Storage {
  private _memoryStorage = inject(MEMORY_STORAGE);
  private usedKeys = new Set<string>();

  get length(): number {
    return this.usedKeys.size;
  }

  clear(): void {
    this.usedKeys.forEach((key) => {
      this._memoryStorage.removeItem(key);
    });
    this.usedKeys.clear();
  }

  getItem(key: string): string | null {
    return this._memoryStorage.getItem(this.calcKey(key));
  }

  key(index: number): string | null {
    return this._memoryStorage.key(index);
  }

  removeItem(key: string): void {
    const realKey = this.calcKey(key);
    this._memoryStorage.removeItem(realKey);
    this.usedKeys.delete(realKey);
  }

  setItem(key: string, value: string): void {
    const realKey = this.calcKey(key);
    this._memoryStorage.setItem(realKey, value);
    this.usedKeys.add(realKey);
  }

  private calcKey(key: string): string {
    return `EXECUTION_${key}`;
  }
}
