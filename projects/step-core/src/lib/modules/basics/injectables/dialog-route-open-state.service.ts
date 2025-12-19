import { effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, first, Subject, switchMap, takeUntil, timer } from 'rxjs';

export const DIALOG_ROUTE_CLASS = 'step-dialog-route-open';

@Injectable({
  providedIn: 'root',
})
export class DialogRouteOpenStateService {
  private _doc = inject(DOCUMENT);
  private _router = inject(Router);

  private isOpenInternal = signal(false);
  readonly isOpen = this.isOpenInternal.asReadonly();

  private effectOpenStateChange = effect(() => {
    const isOpen = this.isOpen();
    if (isOpen) {
      this._doc?.body?.classList?.add?.(DIALOG_ROUTE_CLASS);
    } else {
      this._doc?.body?.classList?.remove?.(DIALOG_ROUTE_CLASS);
    }
  });

  private navigationEndTerminator$?: Subject<void>;

  markAsOpen(): void {
    this.terminate();
    this.isOpenInternal.set(true);
  }

  markAsClosed(): void {
    if (!this.navigationEndTerminator$) {
      this.navigationEndTerminator$ = new Subject<void>();
    }
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        first(),
        switchMap(() => timer(100)),
        takeUntil(this.navigationEndTerminator$),
      )
      .subscribe(() => {
        this.isOpenInternal.set(false);
      });
  }

  private terminate(): void {
    this.navigationEndTerminator$?.next?.();
    this.navigationEndTerminator$?.complete?.();
    this.navigationEndTerminator$ = undefined;
  }
}
