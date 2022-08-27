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
    this._viewRegistryService.registerCustomMenuEntry('Automation', 'automation-root', 'glyphicon glyphicon-play');
    this._viewRegistryService.registerCustomMenuEntry('Execute', 'execute-root', 'glyphicon glyphicon-tasks');
    this._viewRegistryService.registerCustomMenuEntry('Status', 'status-root', 'glyphicon glyphicon-ok');

    // Sub Menus Automation
    this._viewRegistryService.registerCustomMenuEntry(
      'Keywords',
      'functions',
      'glyphicon glyphicon-record',
      'automation-root'
    );
    this._viewRegistryService.registerCustomMenuEntry('Plans', 'plans', 'glyphicon glyphicon-file', 'automation-root');
    this._viewRegistryService.registerCustomMenuEntry(
      'Parameters',
      'parameters',
      'glyphicon glyphicon-list-alt',
      'automation-root'
    );
    // Sub Menus Execute
    this._viewRegistryService.registerCustomMenuEntry(
      'Executions',
      'executions',
      'glyphicon glyphicon-tasks',
      'execute-root'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Scheduler',
      'scheduler',
      'glyphicon glyphicon-time',
      'execute-root'
    );
    // Sub Menus Status
    this._viewRegistryService.registerCustomMenuEntry(
      'Agents',
      'gridagents',
      'glyphicon glyphicon-briefcase',
      'status-root'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Agent tokens',
      'gridtokens',
      'glyphicon glyphicon-tag',
      'status-root'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Token Groups',
      'gridtokengroups',
      'glyphicon glyphicon glyphicon-tags',
      'status-root'
    );
    this._viewRegistryService.registerCustomMenuEntry(
      'Quota Manager',
      'gridquotamanager',
      'glyphicon glyphicon-road',
      'status-root'
    );
    this.mainMenuEntriesAmount = _viewRegistryService.getCustomMainMenuEntries().length - 1;
  }

  ngAfterViewInit(): void {
    let initialViewName = this._viewStateService.getViewName();
    if (initialViewName) {
      let initiallyExpandedMainMenu = this._viewRegistryService.getMainMenuNameOfSubmenu(initialViewName!);
      if (initiallyExpandedMainMenu) {
        this.openMainMenu(initiallyExpandedMainMenu);
      }
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
