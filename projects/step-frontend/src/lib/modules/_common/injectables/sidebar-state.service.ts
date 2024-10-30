import { inject, Injectable, OnDestroy } from '@angular/core';
import { IS_SMALL_SCREEN, LogoutCleanup, Mutable } from '@exense/step-core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, pairwise } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { MenuStorageService } from './menu-storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const MAIN_WHEN_SIDEBAR_CLOSED = 'main-when-sidebar-closed';
const MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN = 'main-when-sidebar-closed-small-screen';
const TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED = 'tenant-selector-when-sidebar-closed';
const IS_MENU_OPENED = 'IS_MENU_OPENED';
const OPENED_MENU_ITEMS = 'OPENED_MENU_ITEMS';
const PROJECTS_READ_ONLY_WHEN_SIDEBAR_CLOSED = 'projects-read-only-when-sidebar-closed';

type MutableOpenedMenuItems = Record<string, boolean>;
type OpenedMenuItems = Readonly<Record<string, boolean>>;
type FieldAccessor = Mutable<Pick<SidebarStateService, 'openedMenuItems'>>;

@Injectable({
  providedIn: 'root',
})
export class SidebarStateService implements OnDestroy, LogoutCleanup {
  private _menuStorage = inject(MenuStorageService);
  private _document = inject(DOCUMENT);
  private _isSmallScreen$ = inject(IS_SMALL_SCREEN).pipe(distinctUntilChanged(), takeUntilDestroyed());

  private isOpenedInternal$ = new BehaviorSubject<boolean>(this.getIsOpenedInitialValue());

  readonly isOpened$ = this.isOpenedInternal$.asObservable().pipe(distinctUntilChanged());

  readonly openedMenuItems = this.getOpenedMenuItemsInitialValue();

  get isOpened(): boolean {
    return this.isOpenedInternal$.value;
  }

  private set isOpened(value: boolean) {
    if (value === this.isOpened) {
      return;
    }
    this.isOpenedInternal$.next(value);
    this._menuStorage.setItem(IS_MENU_OPENED, value.toString());
  }

  initialize() {
    this.setupSmallScreenChange();
    this.setupIsOpenedChange();
  }

  ngOnDestroy(): void {
    this.isOpenedInternal$.complete();
  }

  toggleIsOpened(): void {
    this.isOpened = !this.isOpened;
  }

  logoutCleanup(): void {
    (this as FieldAccessor).openedMenuItems = undefined;
    this.isOpenedInternal$.next(true);
  }

  setMenuItemState(menuItem: string, isOpened: boolean): void {
    if (!this.openedMenuItems) {
      (this as FieldAccessor).openedMenuItems = {};
    }
    if (this.openedMenuItems![menuItem] === isOpened) {
      return;
    }
    (this.openedMenuItems! as MutableOpenedMenuItems)[menuItem] = isOpened;
    this._menuStorage.setItem(OPENED_MENU_ITEMS, JSON.stringify(this.openedMenuItems!));
  }

  initializeProjectsReadOnly() {
    if (!this.isOpened) {
      const projectsReadOnly = this._document.querySelector('#projects-read-only');
      projectsReadOnly?.classList?.add(PROJECTS_READ_ONLY_WHEN_SIDEBAR_CLOSED);
    }
  }

  private setupSmallScreenChange(): void {
    this._isSmallScreen$
      .pipe(
        pairwise(),
        filter(([previous, current]) => !previous && current),
      )
      .subscribe(() => {
        if (this.isOpened) {
          this.isOpened = false;
        }
      });
  }

  /**
   * FIXME: instead of selecting global dom elements class assignment should be done in components itself when it will be migrated
   */
  private setupIsOpenedChange(): void {
    combineLatest([this.isOpened$, this._isSmallScreen$]).subscribe(([isOpened, isSmallScreen]) => {
      const main = this._document.querySelector('#main');
      const tenantSelection = this._document.querySelector('#project-select');
      const projectsReadOnly = this._document.querySelector('#projects-read-only');

      if (!isOpened) {
        if (isSmallScreen) {
          main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED);
          main!.classList.add(MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN);
        } else {
          main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN);
          main!.classList.add(MAIN_WHEN_SIDEBAR_CLOSED);
        }
        tenantSelection?.classList?.add?.(TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED);
        projectsReadOnly?.classList?.add(PROJECTS_READ_ONLY_WHEN_SIDEBAR_CLOSED);
      } else {
        main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED);
        main!.classList.remove(MAIN_WHEN_SIDEBAR_CLOSED_SMALL_SCREEN);
        tenantSelection?.classList?.remove?.(TENANT_SELECTOR_WHEN_SIDEBAR_CLOSED);
        projectsReadOnly?.classList?.remove?.(PROJECTS_READ_ONLY_WHEN_SIDEBAR_CLOSED);
      }
    });
  }

  private getIsOpenedInitialValue(): boolean {
    const stringValue = this._menuStorage.getItem(IS_MENU_OPENED);
    if (!stringValue) {
      return true;
    }
    return stringValue === 'true';
  }

  private getOpenedMenuItemsInitialValue(): OpenedMenuItems | undefined {
    const stringValue = this._menuStorage.getItem(OPENED_MENU_ITEMS);
    if (!stringValue) {
      return undefined;
    }
    let result: OpenedMenuItems | undefined;
    try {
      result = JSON.parse(stringValue) as OpenedMenuItems;
    } catch (e) {
      result = undefined;
    }
    return result;
  }
}
