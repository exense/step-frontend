import { inject, Injectable, OnDestroy } from '@angular/core';
import { IS_TOUCH_DEVICE } from '@exense/step-core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { DOCUMENT } from '@angular/common';

const MAIN_WHEN_SIDEBAR_CLOSED = 'main-when-sidebar-closed';
const MAIN_WHEN_SIDEBAR_CLOSED_TOUCH = 'main-when-sidebar-closed-touch';
const TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED = 'tenant-selector-when-sidebar-closed';

@Injectable({
  providedIn: 'root',
})
export class SidebarOpenStateService implements OnDestroy {
  private _isTouch = inject(IS_TOUCH_DEVICE);
  private _document = inject(DOCUMENT);

  private isOpenedInternal$ = new BehaviorSubject<boolean>(!this._isTouch);

  readonly isOpened$ = this.isOpenedInternal$.asObservable();

  get isOpened(): boolean {
    return this.isOpenedInternal$.value;
  }

  constructor() {
    this.setupIsOpenedChange();
  }

  ngOnDestroy(): void {
    this.isOpenedInternal$.complete();
  }

  toggleIsOpened(): void {
    this.isOpenedInternal$.next(!this.isOpened);
  }

  /**
   * FIXME: instead of selecting global dom elements class assignment should be done in components itself when it will be migrated
   */
  private setupIsOpenedChange(): void {
    this.isOpened$.pipe(distinctUntilChanged()).subscribe((isOpened) => {
      const main = this._document.querySelector('#main');
      const tenantSelection = this._document.querySelector('step-tenant-selection-downgraded');

      if (!isOpened) {
        main!.classList.add(this._isTouch ? MAIN_WHEN_SIDEBAR_CLOSED_TOUCH : MAIN_WHEN_SIDEBAR_CLOSED);
        tenantSelection!.classList.add(TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED);
      } else {
        main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED);
        main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED_TOUCH);
        tenantSelection!.classList.remove(TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED);
      }
    });
  }
}
