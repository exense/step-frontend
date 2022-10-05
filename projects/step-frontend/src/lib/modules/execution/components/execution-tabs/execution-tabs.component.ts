import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExecutionTab } from '../../shared/execution-tab';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';

@Component({
  selector: 'step-execution-tabs',
  templateUrl: './execution-tabs.component.html',
  styleUrls: ['./execution-tabs.component.scss'],
})
export class ExecutionTabsComponent {
  @Input() tabs: ExecutionTab[] = [];
  @Input() activeTabId?: string;
  @Output() activeTabIdChange = new EventEmitter<string>();
  @Output() closeTab = new EventEmitter<string>();
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionTabs', downgradeComponent({ component: ExecutionTabsComponent }));
