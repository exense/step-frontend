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
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Tab } from '../../shared/tab';
import { MatTabNav } from '@angular/material/tabs';

@Component({
  selector: 'step-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  exportAs: 'StepTabs',
  encapsulation: ViewEncapsulation.None,
})
export class TabsComponent<T extends string | number> implements OnChanges {
  readonly trackByTab: TrackByFunction<Tab<T>> = (index, item) => item.id;

  @ViewChild(MatTabNav)
  private tabBar!: MatTabNav;

  @Input() tabMode: 'buttons' | 'tabs' = 'buttons';
  @Input() disablePagination: boolean = false;
  @Input() tabs: Tab<T>[] = [];
  @Input() activeTabId?: T;
  @Input() tabTemplate?: TemplateRef<unknown>;
  @Output() activeTabIdChange = new EventEmitter<T>();

  @HostBinding('class.shrink') @Input() shrink: boolean = false;
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

  selectTab(tab: Tab<T>): void {
    this.activeTabId = tab.id;
    this.activeTabIdChange.emit(tab.id);
  }

  updatePagination(): void {
    this.tabBar.updatePagination();
  }
}
