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

  mainMenuEntriesAmount: number;
  sideBarOpen: boolean = true;

  constructor(
    @Inject(DOCUMENT) private _doc: Document,
    public _authService: AuthService,
    public _viewRegistryService: ViewRegistryService,
    public _viewStateService: ViewStateService,
    public _location: Location
  ) {
    // Main Menus
    this._viewRegistryService.registerMenuEntry('Automation', 'automation-root', 'glyphicon glyphicon-play');
    this._viewRegistryService.registerMenuEntry('Execute', 'execute-root', 'glyphicon glyphicon-tasks');
    this._viewRegistryService.registerMenuEntry('Status', 'status-root', 'glyphicon glyphicon-ok');

    // Sub Menus Automation
    this._viewRegistryService.registerMenuEntry(
      'Keywords',
      'functions',
      'glyphicon glyphicon-record',
      'automation-root'
    );
    this._viewRegistryService.registerMenuEntry('Plans', 'plans', 'glyphicon glyphicon-file', 'automation-root');
    this._viewRegistryService.registerMenuEntry(
      'Parameters',
      'parameters',
      'glyphicon glyphicon-list-alt',
      'automation-root'
    );
    // Sub Menus Execute
    this._viewRegistryService.registerMenuEntry(
      'Executions',
      'executions',
      'glyphicon glyphicon-tasks',
      'execute-root'
    );
    this._viewRegistryService.registerMenuEntry('Scheduler', 'scheduler', 'glyphicon glyphicon-time', 'execute-root');
    // Sub Menus Status
    this._viewRegistryService.registerMenuEntry('Agents', 'gridagents', 'glyphicon glyphicon-briefcase', 'status-root');
    this._viewRegistryService.registerMenuEntry('Agent tokens', 'gridtokens', 'glyphicon glyphicon-tag', 'status-root');
    this._viewRegistryService.registerMenuEntry(
      'Token Groups',
      'gridtokengroups',
      'glyphicon glyphicon glyphicon-tags',
      'status-root'
    );
    this._viewRegistryService.registerMenuEntry(
      'Quota Manager',
      'gridquotamanager',
      'glyphicon glyphicon-road',
      'status-root'
    );
    this.mainMenuEntriesAmount = _viewRegistryService.getCustomMainMenuEntries().length - 1;
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
      this._doc.querySelector('#main')!.classList.add('main-when-sidebar-closed');
      this._doc.querySelector('step-tenant-selection-downgraded')!.classList.add('tenant-selector-when-sidebar-closed');
    } else {
      this.sideBarOpen = true;
      this._doc.querySelector('#main')!.classList.remove('main-when-sidebar-closed');
      this._doc
        .querySelector('step-tenant-selection-downgraded')!
        .classList.remove('tenant-selector-when-sidebar-closed');
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSidebar', downgradeComponent({ component: SidebarComponent }));
