import { inject, Injectable, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { AugmentedScreenService, ScreenInput } from '../../../client/step-client-module';
import { map, Observable, of, tap } from 'rxjs';

@Injectable()
export class TableCustomColumnsService implements OnDestroy {
  private _screenApiService = inject(AugmentedScreenService);

  private screenColumns = new Map<string, WritableSignal<ScreenInput[]>>();

  getScreenColumnsSignal(screen: string): Signal<ScreenInput[]> {
    return this.getScreenColumnsSignalInternal(screen).asReadonly();
  }

  updateColumnsForScreen(screen?: string, clearCache?: boolean): Observable<boolean> {
    if (!screen) {
      return of(false);
    }
    if (clearCache) {
      this._screenApiService.clearCacheForScreen(screen);
    }
    return this._screenApiService.getScreenInputsByScreenIdWithCache(screen).pipe(
      tap((columns) => {
        this.getScreenColumnsSignalInternal(screen).set(columns);
      }),
      map(() => true),
    );
  }

  ngOnDestroy(): void {
    this.screenColumns.clear();
  }

  private getScreenColumnsSignalInternal(screen: string): WritableSignal<ScreenInput[]> {
    if (!this.screenColumns.has(screen)) {
      this.screenColumns.set(screen, signal<ScreenInput[]>([]));
    }
    return this.screenColumns.get(screen)!;
  }
}
