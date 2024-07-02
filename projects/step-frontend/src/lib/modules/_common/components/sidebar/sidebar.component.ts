import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  QueryList,
  TrackByFunction,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  IS_SMALL_SCREEN,
  MenuEntry,
  NavigatorService,
  ViewRegistryService,
  ViewStateService,
  BookmarkService,
  MENU_ITEMS,
  AugmentedBookmarksService,
} from '@exense/step-core';
import { VersionsDialogComponent } from '../versions-dialog/versions-dialog.component';
import { combineLatest, map, Subject, SubscriptionLike, takeUntil } from 'rxjs';
import { SidebarStateService } from '../../injectables/sidebar-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const MIDDLE_BUTTON = 1;

@Component({
  selector: 'step-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  private _navigator = inject(NavigatorService);
  private _viewRegistryService = inject(ViewRegistryService);
  private _zone = inject(NgZone);
  public _viewStateService = inject(ViewStateService);
  private _matDialog = inject(MatDialog);
  private _bookmarkService = inject(BookmarkService);
  private _location = inject(Location);

  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<ElementRef>;
  @ViewChild('tabs') tabs?: ElementRef<HTMLElement>;

  private locationStateSubscription = this._location.subscribe((popState: any) => {
    this.openMainMenuBasedOnActualView();
  });

  private _sideBarState = inject(SidebarStateService);
  readonly _menuItems$ = inject(MENU_ITEMS).pipe(takeUntilDestroyed());
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  readonly displayMenuItems$ = combineLatest([this._menuItems$, this._bookmarkService.bookmarks$]).pipe(
    map(([menuItems, dynamicMenuItems]) =>
      menuItems.concat(
        dynamicMenuItems!
          .map((element) => {
            const menuEntry = {
              title: element.customFields!['label'],
              id: element.customFields!['link'],
              icon: element.customFields!['icon'],
              position: element.customFields!['position'] || 100,
              parentId: 'bookmarks-root',
              weight: 1000 + dynamicMenuItems!.length,
              isEnabledFct(): boolean {
                return true;
              },
            };
            return menuEntry;
          })
          .sort((a: any, b: any) => {
            const posA = a.position;
            const posB = b.position;
            if (posA < posB) {
              return -1;
            } else if (posB < posA) {
              return 1;
            } else {
              return 0;
            }
          }),
      ),
    ),
  );

  readonly isOpened$ = this._sideBarState.isOpened$;
  readonly trackByMenuEntry: TrackByFunction<MenuEntry> = (index, item) => item.id;

  ngAfterViewInit(): void {
    this._sideBarState.initialize();
    this._menuItems$.subscribe(() => {
      setTimeout(() => {
        // zero timout is used, to create a macrotasks
        // that will be invoked after menu render
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

  navigateTo(viewId: string, $event: MouseEvent): void {
    const isOpenInSeparateTab = $event.ctrlKey || $event.button === MIDDLE_BUTTON || $event.metaKey;

    switch (viewId) {
      case 'home':
        this._navigator.navigateToHome({ isOpenInSeparateTab, forceClientUrl: true });
        break;
      default:
        this._navigator.navigate(viewId, isOpenInSeparateTab);
        break;
    }
  }

  toggleOpenClose() {
    this._sideBarState.toggleIsOpened();
  }

  showVersionsDialog(): void {
    this._matDialog.open(VersionsDialogComponent);
  }

  handleScroll($event: Event): void {
    this._zone.runOutsideAngular(() => {
      const scrollTop = ($event.target as HTMLElement).scrollTop;
      this.tabs!.nativeElement.setAttribute('style', `--scrollOffset: -${scrollTop}px`);
    });
  }
}
