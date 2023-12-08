import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExecutionTab } from '../../shared/execution-tab';

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
