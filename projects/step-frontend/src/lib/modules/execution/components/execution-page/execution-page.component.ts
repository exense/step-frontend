import { Component, OnDestroy, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution } from '@exense/step-core';
import { ExecutionTab } from '../../shared/execution-tab';

@Component({
  selector: 'step-execution-page',
  templateUrl: './execution-page.component.html',
  styleUrls: ['./execution-page.component.scss'],
})
export class ExecutionPageComponent implements OnInit, OnDestroy {
  listTab: ExecutionTab = { label: 'Executions', type: 'list', id: 'list', title: 'Executions List' };
  tabs: ExecutionTab[] = [this.listTab];
  activeTab!: ExecutionTab;

  private locationChangeFunction = () => {
    let urlParts = this.getUrlParts();
    const executionId = urlParts[1];
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
          title: executionId,
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
    // window.history.replaceState({}, '', url);
    location.href = url;
  }

  createUrl(tab: ExecutionTab): string {
    const url = window.location.href;
    let startIndex = url.indexOf('executions');
    let endIndex: number | undefined = url.indexOf('?');
    endIndex = endIndex > 0 ? endIndex : undefined;
    let urlItems = url.substring(startIndex, endIndex).split('/');
    urlItems[1] = tab.id;
    if (tab.subTab) {
      urlItems[2] = tab.subTab;
    } else {
      urlItems.length = 2;
    }
    return url.substring(0, startIndex) + urlItems.join('/') + (endIndex ? url.substring(endIndex) : '');
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
    const url = window.location.href;
    let startIndex = url.indexOf('executions');
    let urlItems = this.getUrlParts();
    urlItems[2] = subTab;
    let paramsIndex: number | undefined = url.indexOf('?');
    paramsIndex = paramsIndex > 0 ? paramsIndex : undefined;
    let newUrl = url.substring(0, startIndex) + urlItems.join('/') + (paramsIndex ? url.substring(paramsIndex) : '');
    history.replaceState({}, '', newUrl);
  }

  handleTabClose(tabId: string) {
    let indexToBeDeleted = this.tabs.findIndex((tab) => tab.id === tabId);
    this.tabs.splice(indexToBeDeleted, 1);
    // this.tabs = [...this.tabs];
    this.switchTab(this.listTab);
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
    const url = window.location.href;
    // executions/12345/performance
    let paramsIndex: number | undefined = url.indexOf('?');
    paramsIndex = paramsIndex > 0 ? paramsIndex : undefined;
    let relativePath = url.substring(url.indexOf('executions'), paramsIndex);
    return relativePath.split('/');
  }

  ngOnInit(): void {
    let urlParts = this.getUrlParts(); // [executions, id, subTab]
    const taskId = urlParts[1];
    const subTab = urlParts[2];
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
