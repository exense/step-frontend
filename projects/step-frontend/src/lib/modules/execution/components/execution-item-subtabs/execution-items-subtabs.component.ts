import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Dashlet, Tab, ViewRegistryService } from '@exense/step-core';
import {
  ExecutionTabsCommand,
  ExecutionsTabsControlService,
  ExecutionTabsCommandType,
} from '../../services/executions-tabs-control.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-execution-items-subtabs',
  templateUrl: './execution-items-subtabs.component.html',
  styleUrls: ['./execution-items-subtabs.component.scss'],
})
export class ExecutionItemsSubtabsComponent implements OnDestroy {
  @Input() executionId?: string;
  @Input() activeTabId?: string;
  @Output() activeTabIdChange = new EventEmitter<string>();

  readonly tabs: Array<Tab>;

  private terminator$ = new Subject();

  constructor(
    private _viewRegistryService: ViewRegistryService,
    private _executionTabsControlService: ExecutionsTabsControlService
  ) {
    this.tabs = this._viewRegistryService
      .getDashlets('executionTab')
      .filter((dashlet) => {
        return dashlet.isEnabledFct ? dashlet.isEnabledFct() : false;
      })
      .map<Tab>((dashlet) => this.dashletToTab(dashlet));
    this._executionTabsControlService.command$
      .pipe(takeUntil(this.terminator$))
      .subscribe((command: ExecutionTabsCommand) => {
        this.handleExecutionTabsCommand(command);
      });
  }

  private handleExecutionTabsCommand(command: ExecutionTabsCommand) {
    if (command.executionId === this.executionId) {
      switch (command.command) {
        case ExecutionTabsCommandType.DISABLE:
          this.disableTabById(command.id);
          break;
        default:
          break;
      }
    }
  }

  private disableTabById(id: string): void {
    let tab = this.findTabById(id);
    if (!!tab) {
      tab.disabled = true;
    }
  }

  private findTabById(id: string): Tab | undefined {
    return this.tabs.find((tab) => tab.id === id);
  }

  private dashletToTab(dashlet: Dashlet): Tab {
    return {
      id: dashlet.id,
      label: dashlet.label,
      disabled: false,
    };
  }

  ngOnDestroy(): void {
    this.terminator$.next(undefined);
    this.terminator$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionItemsSubtabs', downgradeComponent({ component: ExecutionItemsSubtabsComponent }));
