import { Component, EventEmitter, Input, Output } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Dashlet, Tab, ViewRegistryService } from '@exense/step-core';
import {
  ExecutionTabsCommand,
  ExecutionsTabsControlService,
  ExecutionTabsCommandType,
} from '../../services/executions-tabs-control.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'step-execution-tabs',
  templateUrl: './execution-tabs.component.html',
  styleUrls: ['./execution-tabs.component.scss'],
})
export class ExecutionTabsComponent {
  @Input() executionId?: string;
  @Input() activeTabId?: string;
  @Output() activeTabIdChange = new EventEmitter<string>();

  readonly tabs: Array<Tab>;

  private subscription: Subscription;

  constructor(
    private _viewRegistryService: ViewRegistryService,
    private _executionTabsControlService: ExecutionsTabsControlService
  ) {
    this.tabs = this._viewRegistryService.getDashlets('executionTab').map<Tab>((dashlet) => this.dashletToTab(dashlet));
    this.subscription = this._executionTabsControlService.controlSubject$.subscribe((command: ExecutionTabsCommand) => {
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
    return this.tabs.filter((tab) => tab.id === id)[0];
  }

  private dashletToTab(dashlet: Dashlet): Tab {
    return {
      id: dashlet.id,
      label: dashlet.label,
      disabled: false,
    };
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionTabs', downgradeComponent({ component: ExecutionTabsComponent }));
