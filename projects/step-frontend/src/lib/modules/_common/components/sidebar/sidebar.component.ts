import { Component, Input, QueryList, ViewChildren, AfterViewInit, ElementRef, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AuthService, MenuEntry, ViewRegistryService, ViewStateService } from '@exense/step-core';
import { DOCUMENT, Location } from '@angular/common';

@Component({
  selector: '[step-sidebar]',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<ElementRef>;
  @Input() logo: string = 'images/logotopleft.png';

  sideBarOpen: boolean = true;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    public _authService: AuthService,
    public _viewRegistryService: ViewRegistryService,
    public _viewStateService: ViewStateService,
    public _location: Location
  ) {}

  ngAfterViewInit(): void {
    const initialViewName = this._viewStateService.getViewName();
    if (initialViewName) {
      let initiallyExpandedMainMenu = this._viewRegistryService.getMainMenuKey(initialViewName!);
      if (initiallyExpandedMainMenu) {
        this.openMainMenu(initiallyExpandedMainMenu);
      }
    }
  }

  private openMainMenu(mainMenuName: string): void {
    const checkbox = this.mainMenuCheckBoxes?.find((item) => item.nativeElement.getAttribute('name') === mainMenuName);
    if (checkbox) {
      checkbox.nativeElement.setAttribute('checked', true);
    }
  }

  public trackByFn(index: number, item: MenuEntry) {
    return item.viewId;
  }

  public navigateTo(viewId: string): void {
    console.log(viewId);

    switch (viewId) {
      case 'home':
        this._authService.gotoDefaultPage();
        break;
      default:
        this._location.go('#/root/' + viewId);
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
