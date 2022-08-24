import { Component, EventEmitter, Input, Output, TemplateRef, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { Tab } from '../../shared/tab';
import { AJS_MODULE } from '../../../../shared';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';

@Component({
  selector: 'step-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TabsComponent {
  readonly trackByTab: TrackByFunction<Tab> = (index, item) => item.id;

  @Input() tabs: Tab[] = [];
  @Input() activeTabId?: string;
  @Input() tabTemplate?: TemplateRef<unknown>;
  @Output() activeTabIdChange = new EventEmitter<string>();

  selectTab(tab: Tab): void {
    this.activeTabId = tab.id;
    this.activeTabIdChange.emit(tab.id);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepTabs', downgradeComponent({ component: TabsComponent }));
