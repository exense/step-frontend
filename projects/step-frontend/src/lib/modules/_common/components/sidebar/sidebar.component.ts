import { Component, Input, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AuthService, ViewRegistryService, ViewStateService } from '@exense/step-core';
import { Location } from '@angular/common';

@Component({
  selector: '[step-sidebar]',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  @ViewChildren('mainMenuCheckBox') mainMenuCheckBoxes?: QueryList<any>;
  @Input() logo: string = 'images/logotopleft.png';

  public mainMenuEntriesAmount: number;

  constructor(
    public _authService: AuthService,
    public _viewRegistryService: ViewRegistryService,
    public _viewStateService: ViewStateService,
    public _location: Location
  ) {
    // Main Menus
    this._viewRegistryService.registerCustomMenuEntry('Automation', undefined, true, 'glyphicon glyphicon-play');
    this._viewRegistryService.registerCustomMenuEntry('Execute', undefined, true, 'glyphicon glyphicon-tasks');
    this._viewRegistryService.registerCustomMenuEntry('Status', undefined, true, 'glyphicon glyphicon-ok');
    // Sub Menus Automation
    this._viewRegistryService.registerCustomMenuEntry(
      'Keywords',
      'functions',
      false,
      'glyphicon glyphicon-record',
      undefined,
      'Automation'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Plans',
      'plans',
      false,
      'glyphicon glyphicon-file',
      undefined,
      'Automation'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Parameters',
      'parameters',
      false,
      'glyphicon glyphicon-list-alt',
      undefined,
      'Automation'
    );
    // Sub Menus Execute
    this._viewRegistryService.registerCustomMenuEntry(
      'Executions',
      'executions',
      false,
      'glyphicon glyphicon-tasks',
      undefined,
      'Execute'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Scheduler',
      'scheduler',
      false,
      'glyphicon glyphicon-time',
      undefined,
      'Execute'
    );
    // Sub Menus Status
    this._viewRegistryService.registerCustomMenuEntry(
      'Agents',
      'gridagents',
      false,
      'glyphicon glyphicon-briefcase',
      undefined,
      'Status'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Agent tokens',
      'gridtokens',
      false,
      'glyphicon glyphicon-tag',
      undefined,
      'Status'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Token Groups',
      'gridtokengroups',
      false,
      'glyphicon glyphicon glyphicon-tags',
      undefined,
      'Status'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Quota Manager',
      'gridquotamanager',
      false,
      'glyphicon glyphicon-road',
      undefined,
      'Status'
    );
    this.mainMenuEntriesAmount = _viewRegistryService.getCustomMainMenuEntries().length - 1;
  }

  ngAfterViewInit(): void {
    let initialViewName = this._viewStateService.getViewName();
    if (initialViewName) {
      let initiallyExpandedMainMenu = this._viewRegistryService.getMainMenuNameOfSubmenu(initialViewName!);
      this.openMainMenu(initiallyExpandedMainMenu);
    }
  }

  private openMainMenu(mainMenuName: string): void {
    for (let checkbox of this.mainMenuCheckBoxes!) {
      let name = checkbox.nativeElement.getAttribute('name');
      if (name === mainMenuName) {
        checkbox.nativeElement.setAttribute('checked', true);
      }
    }
  }

  public navigateTo(viewId: string): void {
    switch (viewId) {
      case 'plans':
        this._location.go('#/root/plans/list');
        break;
      default:
        this._location.go('#/root/' + viewId);
        break;
    }
  }

  /**
   * this is a workaround to downgrade the component to AngularJS as an attribute directive rather than an element directive
   * @param componentFactory
   */
  static allowAttribute(componentFactory: any) {
    const wrapper = function ($compile: any, $injector: any, $parse: any) {
      const component = componentFactory($compile, $injector, $parse);
      component.restrict = 'A';
      return component;
    };
    wrapper.$inject = ['$compile', '$injector', '$parse'];
    return wrapper;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSidebar', SidebarComponent.allowAttribute(downgradeComponent({ component: SidebarComponent })));
