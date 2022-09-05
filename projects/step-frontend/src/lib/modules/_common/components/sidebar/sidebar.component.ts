import { Component, Input, QueryList, ViewChildren, AfterViewInit, ElementRef, Inject, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_LOCATION, AJS_MODULE, AuthService, MenuEntry, ViewRegistryService, ViewStateService } from '@exense/step-core';
import { DOCUMENT, Location } from '@angular/common';
import { ILocationService } from 'angular';

@Component({
  selector: '[step-sidebar]',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<ElementRef>;
  @Input() logo: string = 'images/logotopleft.png';

  sideBarOpen: boolean = true;

  private locationStateSubscription: any;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    public _authService: AuthService,
    public _viewRegistryService: ViewRegistryService,
    public _viewStateService: ViewStateService,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {
    this.locationStateSubscription = this._location.subscribe((popState: any) => {
      this.openMainMenuBasedOnActualView();
    });
  }

  ngAfterViewInit(): void {
    this.openMainMenuBasedOnActualView();
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

  private openMainMenu(mainMenuKey: string): void {
    const checkbox = this.mainMenuCheckBoxes?.find((item) => item.nativeElement.getAttribute('name') === mainMenuKey);
    if (checkbox) {
      checkbox.nativeElement.checked = true;
    }
  }

  public trackByFn(index: number, item: MenuEntry) {
    return item.viewId;
  }

  public navigateTo(viewId: string): void {
    switch (viewId) {
      case 'home':
        this._authService.gotoDefaultPage();
        break;
      default:
        if (this._location.path().includes('/root/' + viewId)) {
          this._location.path('/');
          setTimeout(() => this._location.path('/root/' + viewId));
        } else {
          this._location.path('/root/' + viewId);
        }
        break;
    }
  }

  /**
   * FIXME: communicate open/close state as output to parent component instead of selecting global dom element
   */
  toggleOpenClose() {
    if (this.sideBarOpen) {
      this.sideBarOpen = false;
      this._document.querySelector('#main')!.classList.add('main-when-sidebar-closed');
      this._document
        .querySelector('step-tenant-selection-downgraded')!
        .classList.add('tenant-selector-when-sidebar-closed');
    } else {
      this.sideBarOpen = true;
      this._document.querySelector('#main')!.classList.remove('main-when-sidebar-closed');
      this._document
        .querySelector('step-tenant-selection-downgraded')!
        .classList.remove('tenant-selector-when-sidebar-closed');
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSidebar', downgradeComponent({ component: SidebarComponent }));
