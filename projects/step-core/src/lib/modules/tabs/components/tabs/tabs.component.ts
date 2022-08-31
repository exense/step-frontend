import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  TrackByFunction,
  ViewEncapsulation,
} from '@angular/core';
import { Tab } from '../../shared/tab';
import { AJS_MODULE } from '../../../../shared';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';

@Component({
  selector: 'step-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TabsComponent implements OnChanges {
  readonly trackByTab: TrackByFunction<Tab> = (index, item) => item.id;

  @Input() tabMode: 'buttons' | 'tabs' = 'buttons';
  @Input() disablePagination: boolean = false;
  @Input() tabs: Tab[] = [];
  @Input() activeTabId?: string;
  @Input() tabTemplate?: TemplateRef<unknown>;
  @Output() activeTabIdChange = new EventEmitter<string>();

  @HostBinding('class.tab-mode-buttons') isTabModeButtons: boolean = true;
  @HostBinding('class.tab-mode-tabs') isTabModeTabs: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cTabMode = changes['tabMode'];
    if (!!cTabMode?.currentValue && (cTabMode?.previousValue !== cTabMode?.currentValue || cTabMode?.firstChange)) {
      const tabMode = cTabMode.currentValue;
      this.isTabModeButtons = tabMode === 'button';
      this.isTabModeTabs = tabMode === 'tabs';
    }
  }

  selectTab(tab: Tab): void {
    this.activeTabId = tab.id;
    this.activeTabIdChange.emit(tab.id);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepTabs', downgradeComponent({ component: TabsComponent }));
