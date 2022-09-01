import { Component, Input, QueryList, ViewChildren, AfterViewInit, ElementRef, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AuthService, ViewRegistryService, ViewStateService } from '@exense/step-core';
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
  ) {
    // Main Menus
    this._viewRegistryService.registerMenuEntry('Automation', 'automation-root', 'glyphicon glyphicon-play', 10);
    this._viewRegistryService.registerMenuEntry('Execute', 'execute-root', 'glyphicon glyphicon-tasks', 20);
    this._viewRegistryService.registerMenuEntry('Status', 'status-root', 'glyphicon glyphicon-ok', 50);

    // Sub Menus Automation
    this._viewRegistryService.registerMenuEntry(
      'Keywords',
      'functions',
      'glyphicon glyphicon-record',
      10,
      'automation-root'
    );
    this._viewRegistryService.registerMenuEntry('Plans', 'plans', 'glyphicon glyphicon-file', 30, 'automation-root');
    this._viewRegistryService.registerMenuEntry(
      'Parameters',
      'parameters',
      'glyphicon glyphicon-list-alt',
      40,
      'automation-root'
    );
    // Sub Menus Execute
    this._viewRegistryService.registerMenuEntry(
      'Executions',
      'executions',
      'glyphicon glyphicon-tasks',
      10,
      'execute-root'
    );
    this._viewRegistryService.registerMenuEntry(
      'Scheduler',
      'scheduler',
      'glyphicon glyphicon-time',
      20,
      'execute-root'
    );
    // Sub Menus Status
    this._viewRegistryService.registerMenuEntry(
      'Agents',
      'gridagents',
      'glyphicon glyphicon-briefcase',
      20,
      'status-root'
    );
    this._viewRegistryService.registerMenuEntry(
      'Agent tokens',
      'gridtokens',
      'glyphicon glyphicon-tag',
      30,
      'status-root'
    );
    this._viewRegistryService.registerMenuEntry(
      'Token Groups',
      'gridtokengroups',
      'glyphicon glyphicon glyphicon-tags',
      40,
      'status-root'
    );
    this._viewRegistryService.registerMenuEntry(
      'Quota Manager',
      'gridquotamanager',
      'glyphicon glyphicon-road',
      50,
      'status-root'
    );
  }

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
