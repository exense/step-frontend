import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution, IS_SMALL_SCREEN } from '@exense/step-core';
import { ExecutionTab } from '../../shared/execution-tab';
import { Router } from '@angular/router';
import { ExecutionOpenNotificatorService } from '../../services/execution-open-notificator.service';

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
  providers: [
    {
      provide: ExecutionOpenNotificatorService,
      useExisting: ExecutionPageComponent,
    },
  ],
})
export class ExecutionPageComponent implements OnInit, OnDestroy, ExecutionOpenNotificatorService {
  private _router = inject(Router);

  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  listTab: ExecutionTab = { label: 'Executions', type: 'list', id: 'list', title: 'Executions List' };
  tabs: ExecutionTab[] = [this.listTab];
  activeTab!: ExecutionTab;

  private locationChangeFunction = () => {
    if (!this._router.url.includes('executions')) {
      return;
    }

    let urlParts = this.getUrlParts();
    const executionId = urlParts[2];
    if (this.activeTab.id === executionId) {
      // the tab didn't change, but just the subcontent
      return;
    }
    if (executionId) {
      let existingTab = this.tabs.find((tab) => tab.id === executionId);
      if (existingTab) {
        this.switchTab(existingTab);
      } else {
        let executionTab: ExecutionTab = {
          id: executionId,
          active: true,
          label: executionId,
          type: 'progress',
          title: '',
        };
        this.tabs.push(executionTab);
        this.switchTab(executionTab);
      }
    } else {
      this.switchTab(this.listTab);
    }
  };

  updateUrl() {
    let url = this.createUrl(this.activeTab);
    if (this.listTab.id === 'list') {
      //FIXME: workarround for url rewrite /executions => /executions/list should be removed with Angular Routing
      this._router.navigateByUrl(url, { replaceUrl: true });
    } else {
      this._router.navigateByUrl(url);
    }
  }

  createUrl(tab: ExecutionTab): string {
    let urlItems = this.getUrlParts();
    urlItems[2] = tab.id;
    if (tab.subTab) {
      urlItems[3] = tab.subTab;
    } else {
      urlItems.length = 3;
    }
    return '/' + urlItems.join('/');
  }

  handleTabChange(tabId: string) {
    let newTab = this.tabs.find((tab) => tab.id === tabId);
    if (newTab) {
      this.switchTab(newTab);
    }
  }

  handleSubTabChange(tabId: string, subTab: string): void {
    let tab = this.tabs.find((tab) => tab.id === tabId);
    if (tab) {
      tab.subTab = subTab;
    }
    this.replaceUrlSubTab(subTab);
  }

  handleTabTitleUpdate(event: { eId: string; execution: Execution }) {
    let tab = this.tabs.find((tab) => tab.id === event.eId);
    if (tab) {
      tab.title = event.execution.description;
      tab.execution = event.execution;
    }
  }

  replaceUrlSubTab(subTab: string): void {
    let urlItems = this.getUrlParts();
    urlItems[3] = subTab;
    this._router.navigate(urlItems);
  }

  handleTabClose(tabId: string, openList: boolean = true) {
    let indexToBeDeleted = this.tabs.findIndex((tab) => tab.id === tabId);
    this.tabs.splice(indexToBeDeleted, 1);
    // this.tabs = [...this.tabs];
    if (openList) {
      this.switchTab(this.listTab);
    }
  }

  switchTab(tab: ExecutionTab) {
    this.tabs.forEach((tab) => (tab.active = false));
    this.activeTab = tab;
    tab.active = true;
    this.updateUrl();
  }

  /**
   * This will return url parts, EXCLUDING params (?param=value&...)
   * @private
   */
  private getUrlParts(): string[] {
    let url = this._router.url.split('?')[0].substring(1); // remove first backslash
    // executions/12345/performance
    let parts = url.split('/');
    return parts;
  }

  openNotify(eId: string) {
    this.locationChangeFunction();
  }

  ngOnInit(): void {
    let urlParts = this.getUrlParts(); // [root, executions, id, subTab]
    const taskId = urlParts[2];
    const subTab = urlParts[3];
    if (taskId && taskId !== 'list') {
      let executionTab: ExecutionTab = {
        id: taskId,
        active: true,
        label: taskId,
        type: 'progress',
        title: taskId,
        subTab: subTab,
      };
      this.tabs.push(executionTab);
      this.switchTab(executionTab);
    } else {
      // we are on list page
      this.switchTab(this.listTab);
    }
    window.addEventListener('hashchange', this.locationChangeFunction);
  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.locationChangeFunction);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionPage', downgradeComponent({ component: ExecutionPageComponent }));
