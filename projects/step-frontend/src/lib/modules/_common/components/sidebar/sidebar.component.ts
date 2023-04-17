import { DOCUMENT, Location } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Inject,
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
  AJS_LOCATION,
  AJS_MODULE,
  AuthService,
  IS_TOUCH_DEVICE,
  MenuEntry,
  ViewRegistryService,
  ViewStateService,
} from '@exense/step-core';
import { ILocationService } from 'angular';
import { VersionsDialogComponent } from '../versions-dialog/versions-dialog.component';
import { MENU_ITEMS } from '../../injectables/menu-items';
import { Subject, SubscriptionLike, takeUntil } from 'rxjs';
import { SidebarOpenStateService } from '../../injectables/sidebar-open-state.service';

@Component({
  selector: 'step-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<ElementRef>;

  private terminator$ = new Subject<void>();
  private locationStateSubscription: SubscriptionLike;

  private _sideBarOpenState = inject(SidebarOpenStateService);
  readonly _menuItems$ = inject(MENU_ITEMS).pipe(takeUntil(this.terminator$));

  readonly isTouchDevice = inject(IS_TOUCH_DEVICE);
  readonly isOpened$ = this._sideBarOpenState.isOpened$;
  readonly trackByMenuEntry: TrackByFunction<MenuEntry> = (index, item) => item.id;

  constructor(
    public _authService: AuthService,
    public _viewRegistryService: ViewRegistryService,
    public _viewStateService: ViewStateService,
    public _location: Location,
    @Inject(AJS_LOCATION) private _ajsLocation: ILocationService,
    private _matDialog: MatDialog
  ) {
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

  public navigateTo(viewId: string): void {
    if (viewId.startsWith(ViewRegistryService.VIEW_ID_LINK_PREFIX)) {
      const link = viewId.split('link:')[1];
      window.open(link, '_blank');
      return;
    }
    switch (viewId) {
      case 'home':
        this._authService.gotoDefaultPage();
        break;
      default:
        if (this._ajsLocation.path().includes('/root/' + viewId)) {
          this._ajsLocation.path('/');
          setTimeout(() => this._ajsLocation.path('/root/' + viewId).replace());
        } else {
          this._ajsLocation.path('/root/' + viewId);
        }
        const queryParams = this._ajsLocation.search();
        if (queryParams['tsParams']) {
          const clear = queryParams['tsParams'].split(',');
          clear.forEach((value: string) => {
            delete queryParams[value];
          });
          delete queryParams.tsParams;
          this._ajsLocation.search(queryParams);
        }
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
