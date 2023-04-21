import { inject, Injectable, OnDestroy } from '@angular/core';
import { IS_SMALL_SCREEN } from '@exense/step-core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  first,
  pairwise,
  Subject,
  takeUntil,
} from 'rxjs';
import { DOCUMENT } from '@angular/common';

const MAIN_WHEN_SIDEBAR_CLOSED = 'main-when-sidebar-closed';
const MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN = 'main-when-sidebar-closed-small-screen';
const TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED = 'tenant-selector-when-sidebar-closed';

@Injectable({
  providedIn: 'root',
})
export class SidebarOpenStateService implements OnDestroy {
  private terminator$ = new Subject<void>();

  private _document = inject(DOCUMENT);
  private _isSmallScreen$ = inject(IS_SMALL_SCREEN).pipe(distinctUntilChanged(), takeUntil(this.terminator$));

  private isOpenedInternal$ = new BehaviorSubject<boolean>(true);

  readonly isOpened$ = this.isOpenedInternal$.asObservable().pipe(distinctUntilChanged());

  get isOpened(): boolean {
    return this.isOpenedInternal$.value;
  }

  constructor() {
    this.setupInitialOpenState();
    this.setupSmallScreenChange();
    this.setupIsOpenedChange();
  }

  ngOnDestroy(): void {
    this.isOpenedInternal$.complete();
    this.terminator$.next();
    this.terminator$.complete();
  }

  toggleIsOpened(): void {
    this.isOpenedInternal$.next(!this.isOpened);
  }

  private setupInitialOpenState(): void {
    this._isSmallScreen$.pipe(first()).subscribe((isSmallScreenInitial) => {
      this.isOpenedInternal$.next(!isSmallScreenInitial);
    });
  }

  private setupSmallScreenChange(): void {
    this._isSmallScreen$
      .pipe(
        pairwise(),
        filter(([previous, current]) => !previous && current)
      )
      .subscribe(() => {
        if (this.isOpened) {
          this.isOpenedInternal$.next(false);
        }
      });
  }

  /**
   * FIXME: instead of selecting global dom elements class assignment should be done in components itself when it will be migrated
   */
  private setupIsOpenedChange(): void {
    combineLatest([this.isOpened$, this._isSmallScreen$]).subscribe(([isOpened, isSmallScreen]) => {
      const main = this._document.querySelector('#main');
      const tenantSelection = this._document.querySelector('step-tenant-selection-downgraded');

      if (!isOpened) {
        if (isSmallScreen) {
          main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED);
          main!.classList.add(MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN);
        } else {
          main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN);
          main!.classList.add(MAIN_WHEN_SIDEBAR_CLOSED);
        }
        tenantSelection!.classList.add(TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED);
      } else {
        main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED);
        main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN);
        tenantSelection!.classList.remove(TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED);
      }
    });
  }
}
