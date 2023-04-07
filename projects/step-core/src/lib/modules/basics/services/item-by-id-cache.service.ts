import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export abstract class ItemByIdCacheService<T> implements OnDestroy {
  private itemsCache = new Map<string, T>();

  getItem(id: string): Observable<T> {
    if (this.itemsCache.has(id)) {
      return of(this.itemsCache.get(id)!);
    }
    return this.loadItem(id).pipe(tap((item) => this.itemsCache.set(id, item)));
  }

  removeFromCache(id: string): void {
    this.itemsCache.delete(id);
  }

  clearAll(): void {
    this.itemsCache.clear();
  }

  ngOnDestroy(): void {
    this.clearAll();
  }

  protected abstract loadItem(id: string): Observable<T>;
}
