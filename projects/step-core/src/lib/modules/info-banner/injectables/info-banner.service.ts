import { computed, inject, Injectable, signal } from '@angular/core';
import { iif, map, Observable, of, switchMap, tap, timer } from 'rxjs';

interface StackItem {
  view: string;
  info: string;
}

@Injectable({
  providedIn: 'root',
})
export class InfoBannerService {
  private _api = inject(InfoBannerApiMockService);
  private data = new Map<string, string>();

  private hiddenViews?: Set<string>;

  private viewStack = signal<StackItem[]>([]);
  private viewStackTop = computed(() => {
    const viewStack = this.viewStack();
    return viewStack[viewStack.length - 1];
  });

  private actualPath = computed(() => this.viewStackTop()?.view ?? '');
  readonly actualInfo = computed(() => this.viewStackTop()?.info ?? '');

  register(view: string, bannerText: string): void;
  register(data: Record<string, string>): void;
  register(viewOrData: string | Record<string, string>, bannerText?: string): void {
    if (typeof viewOrData === 'string') {
      this.data.set(viewOrData, bannerText ?? '');
      return;
    }
    Object.entries(viewOrData).forEach(([key, value]) => this.data.set(key, value));
  }

  hasInfo(view: string): boolean {
    return this.data.has(view);
  }

  cleanupDisplayedInfo(): void {
    this.viewStack.update((viewStack) => {
      viewStack.pop();
      return [...viewStack];
    });
  }

  displayInfo(view: string): Observable<boolean> {
    return this.getHiddenViews().pipe(
      tap((hiddenViews) => {
        const info = hiddenViews.has(view) ? '' : this.data.get(view) ?? '';
        this.viewStack.update((viewStack) => [...viewStack, { view, info }]);
      }),
      map(() => true),
    );
  }

  hideInfoForActualView(): Observable<boolean> {
    const view = this.actualPath();

    const hide$ = this.getHiddenViews().pipe(
      tap((views) => views.add(view)),
      tap(() => {
        this.viewStack.update((viewStack) => {
          if (viewStack.length <= 0) {
            return viewStack;
          }
          let lastItem = viewStack.pop()!;
          // Object reference should be also change for proper signal update
          lastItem = { ...lastItem, info: '' };
          return [...viewStack, lastItem];
        });
      }),
      map(() => true),
    );

    return this._api.hideBannerForView(view).pipe(switchMap((result) => iif(() => result, hide$, of(result))));
  }

  private getHiddenViews(): Observable<Set<string>> {
    return !!this.hiddenViews
      ? of(this.hiddenViews)
      : this._api.getHiddenViews().pipe(
          map((list) => new Set(list)),
          tap((hiddenViews) => (this.hiddenViews = hiddenViews)),
        );
  }

  private isViewHidden(view: string): Observable<boolean> {
    return this.getHiddenViews().pipe(map((hiddenViews) => hiddenViews.has(view)));
  }
}

@Injectable({
  providedIn: 'root',
})
export class InfoBannerApiMockService {
  // TODO this service emulated backend API for info banner functionality, and should be removed in the near future

  private hiddenBanners = new Set<string>();

  hideBannerForView(view: string): Observable<boolean> {
    return timer(100).pipe(
      tap(() => this.hiddenBanners.add(view)),
      map(() => true),
    );
  }

  getHiddenViews(): Observable<string[]> {
    return timer(100).pipe(map(() => Array.from(this.hiddenBanners)));
  }
}
