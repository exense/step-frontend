import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  TrackByFunction,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  IS_SMALL_SCREEN,
  MenuEntry,
  NavigatorService,
  ViewRegistryService,
  ViewStateService,
} from '@exense/step-core';
import { VersionsDialogComponent } from '../versions-dialog/versions-dialog.component';
import { MENU_ITEMS } from '../../injectables/menu-items';
import { Subject, SubscriptionLike, takeUntil } from 'rxjs';
import { SidebarOpenStateService } from '../../injectables/sidebar-open-state.service';

const MIDDLE_BUTTON = 1;

@Component({
  selector: 'step-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private _navigator = inject(NavigatorService);
  private _viewRegistryService = inject(ViewRegistryService);
  public _viewStateService = inject(ViewStateService);
  private _matDialog = inject(MatDialog);

  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<ElementRef>;

  private terminator$ = new Subject<void>();
  private locationStateSubscription: SubscriptionLike;

  private _sideBarOpenState = inject(SidebarOpenStateService);
  readonly _menuItems$ = inject(MENU_ITEMS).pipe(takeUntil(this.terminator$));
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  readonly isOpened$ = this._sideBarOpenState.isOpened$;
  readonly trackByMenuEntry: TrackByFunction<MenuEntry> = (index, item) => item.id;

  constructor(private _location: Location) {
    this.locationStateSubscription = this._location.subscribe((popState: any) => {
      this.openMainMenuBasedOnActualView();
    });
  }

  ngOnInit(): void {
    this._menuItems$.subscribe(() => {
      setTimeout(() => {
        // zero timout is used, to create a macrotasks
        // that will be invoked after menu render
        this.openMainMenuBasedOnActualView();
        this.openEssentialMainMenus();
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.locationStateSubscription.unsubscribe();
    this.terminator$.next();
    this.terminator$.complete();
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

  private openMainMenu(mainMenuKey: string): void {
    const checkbox = this.mainMenuCheckBoxes?.find((item) => item.nativeElement.getAttribute('name') === mainMenuKey);
    if (checkbox) {
      checkbox.nativeElement.checked = true;
    }
  }

  navigateTo(viewId: string, $event: MouseEvent): void {
    const isOpenInSeparateTab = $event.ctrlKey || $event.button === MIDDLE_BUTTON;

    switch (viewId) {
      case 'home':
        this._navigator.navigateToHome(isOpenInSeparateTab);
        break;
      default:
        this._navigator.navigate(viewId, isOpenInSeparateTab);
        break;
    }
  }

  toggleOpenClose() {
    this._sideBarOpenState.toggleIsOpened();
  }

  showVersionsDialog(): void {
    const dialogRef = this._matDialog.open(VersionsDialogComponent);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSidebar', downgradeComponent({ component: SidebarComponent }));
