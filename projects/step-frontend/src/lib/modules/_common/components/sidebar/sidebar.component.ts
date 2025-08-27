import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CustomMenuEntriesService,
  IS_SMALL_SCREEN,
  MenuEntry,
  NavigatorService,
  ViewRegistryService,
  ViewStateService,
  BookmarkService,
  MENU_ITEMS,
  BookmarkNavigatorService,
  AuthService,
} from '@exense/step-core';
import { VersionsDialogComponent } from '../versions-dialog/versions-dialog.component';
import { combineLatest, first, map, startWith } from 'rxjs';
import { SidebarStateService } from '../../injectables/sidebar-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DisplayMenuEntry } from '../../types/display-menu-entry.type';

const MIDDLE_BUTTON = 1;

const BOOKMARKS_ROOT = 'bookmarks-root';

@Component({
  selector: 'step-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  private _navigator = inject(NavigatorService);
  private _viewRegistryService = inject(ViewRegistryService);
  private _zone = inject(NgZone);
  public _viewStateService = inject(ViewStateService);
  private _matDialog = inject(MatDialog);
  private _bookmarkNavigator = inject(BookmarkNavigatorService);
  private _authService = inject(AuthService);
  private _bookmarkMenuItems$ = inject(BookmarkService).bookmarks$.pipe(
    startWith([]),
    map(
      (bookmarks) =>
        (bookmarks ?? [])
          .map((element) => {
            const menuEntry = {
              title: element.customFields!['label'],
              id: element.customFields!['link'],
              icon: element.customFields!['icon'],
              position: element.customFields!['position'] || 100,
              parentId: BOOKMARKS_ROOT,
              weight: 1000 + bookmarks!.length,
              isEnabledFct(): boolean {
                return true;
              },
            };
            return menuEntry;
          })
          .sort((a, b) => a.position - b.position) as MenuEntry[],
    ),
    takeUntilDestroyed(),
  );
  private _location = inject(Location);

  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<ElementRef>;
  @ViewChild('tabs') tabs?: ElementRef<HTMLElement>;

  private locationStateSubscription = this._location.subscribe((popState: any) => {
    this.openMainMenuBasedOnActualView();
  });

  private _sideBarState = inject(SidebarStateService);
  private _customMenuEntries = inject(CustomMenuEntriesService);
  private _menuItems$ = inject(MENU_ITEMS).pipe(takeUntilDestroyed());
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  readonly displayMenuItems$ = combineLatest([
    this._menuItems$,
    this._customMenuEntries.customMenuEntries$,
    this._bookmarkMenuItems$,
  ]).pipe(
    map(([menuItems, customMenuEntries, bookmarkMenuItems]) => [
      ...menuItems,
      ...customMenuEntries,
      ...bookmarkMenuItems,
    ]),
    map((menuItems) => this.createMenuItemsTree(menuItems)),
  );

  readonly isOpened$ = this._sideBarState.isOpened$;

  ngAfterViewInit(): void {
    this._sideBarState.initialize();
    this.displayMenuItems$.pipe(first()).subscribe(() => {
      setTimeout(() => {
        // zero timout is used, to create a macrotasks
        // that will be invoked after menu render
        this._sideBarState.initializeProjectsReadOnly();
        if (this._sideBarState.openedMenuItems) {
          this.initializeMainMenuItemsFromState();
        } else {
          this.openMainMenuBasedOnActualView();
          this.openEssentialMainMenus();
        }
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.locationStateSubscription.unsubscribe();
  }

  private openMainMenuBasedOnActualView(): void {
    const actualViewName = this._viewStateService.getViewName();
    if (actualViewName) {
      let initiallyExpandedMainMenuKey = this._viewRegistryService.getMainMenuKey(actualViewName!);
      if (initiallyExpandedMainMenuKey) {
        this.openMainMenu(initiallyExpandedMainMenuKey);
      }
    }
  }

  private openEssentialMainMenus(): void {
    const essentialMenuWeightThreshold = 20;
    this._viewRegistryService.getMainMenuAll().forEach((menu: MenuEntry) => {
      if (menu.weight && menu.weight <= essentialMenuWeightThreshold) {
        this.openMainMenu(menu.id);
      }
    });
  }

  private initializeMainMenuItemsFromState(): void {
    Object.entries(this._sideBarState.openedMenuItems || {}).forEach(([mainMenuKey, isOpened]) =>
      this.openMainMenu(mainMenuKey, isOpened),
    );
  }

  private openMainMenu(mainMenuKey: string, isOpened: boolean = true): void {
    const checkbox = this.mainMenuCheckBoxes?.find((item) => item.nativeElement.getAttribute('name') === mainMenuKey);
    if (checkbox) {
      checkbox.nativeElement.checked = isOpened;
    }
    this._sideBarState.setMenuItemState(mainMenuKey, isOpened);
  }

  toggleMenuItem(item: HTMLInputElement): void {
    this._sideBarState.setMenuItemState(item.getAttribute('name')!, item.checked);
  }

  navigateTo(viewId: string, $event: MouseEvent, isBookmark?: boolean): void {
    const isOpenInSeparateTab = $event.ctrlKey || $event.button === MIDDLE_BUTTON || $event.metaKey;

    if (isBookmark) {
      this._bookmarkNavigator.navigateBookmark(viewId, isOpenInSeparateTab);
      return;
    }

    switch (viewId) {
      case 'home':
        this._navigator.navigateToHome({ isOpenInSeparateTab, forceClientUrl: true });
        break;
      default:
        this._navigator.navigate(viewId, isOpenInSeparateTab);
        break;
    }
  }

  removeCustomEntry(id: string, $event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._customMenuEntries.remove(id);
  }

  toggleOpenClose() {
    this._sideBarState.toggleIsOpened();
  }

  showVersionsDialog(): void {
    this._authService
      .hasRight$('admin-ui-menu')
      .subscribe((hasRight) => hasRight && this._matDialog.open(VersionsDialogComponent));
  }

  handleScroll($event: Event): void {
    this._zone.runOutsideAngular(() => {
      const scrollTop = ($event.target as HTMLElement).scrollTop;
      this.tabs!.nativeElement.setAttribute('style', `--scrollOffset: -${scrollTop}px`);
    });
  }

  private createMenuItemsTree(menuItems: MenuEntry[]): DisplayMenuEntry[] {
    console.log('MENU ITEMS', menuItems);

    const weightCompare = (a: MenuEntry, b: MenuEntry) => {
      if (!a.weight) {
        return 1;
      }
      if (!b.weight) {
        return -1;
      }
      return a.weight - b.weight;
    };

    const convert = ({ id, title, icon, isCustom, parentId, isActiveFct }: MenuEntry): DisplayMenuEntry => ({
      id,
      title,
      icon,
      isCustom,
      isBookmark: parentId === BOOKMARKS_ROOT,
      isActiveFct: isActiveFct,
    });

    const findChildren = (parent: DisplayMenuEntry) => {
      const children = menuItems
        .filter((item) => item?.parentId === parent.id && item.isEnabledFct())
        .sort(weightCompare)
        .map(convert);

      const hasChildren = children.length > 0;
      parent.children = children;
      parent.hasChildren = hasChildren;
    };

    const result = menuItems
      .filter((item) => item && !item.parentId && item.isEnabledFct())
      .sort(weightCompare)
      .map(convert);

    result.forEach((parent) => {
      findChildren(parent);
      parent.children?.forEach((child) => findChildren(child));
    });

    console.log('MENU ITEMS TREE', result);

    return result;
  }
}
