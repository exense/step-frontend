import {
  Component,
  effect,
  EventEmitter,
  HostBinding,
  inject,
  input,
  Input,
  OnChanges,
  output,
  Output,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Tab } from '../../shared/tab';
import { MatTabNav } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'step-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  exportAs: 'StepTabs',
  encapsulation: ViewEncapsulation.None,
})
export class TabsComponent<T extends string | number> {
  readonly _activatedRoute = inject(ActivatedRoute, { optional: true });

  /** @ViewChild(MatTabNav) **/
  private tabBar = viewChild(MatTabNav);

  /** @Input() **/
  tabMode = input<'buttons' | 'tabs'>('buttons');

  userRouteLinks = input(false);

  /** @Iput() **/
  disablePagination = input(false);

  /** @Input() **/
  tabs = input<Tab<T>[]>([]);

  /** @Input() **/
  activeTabId = input<T | undefined>();

  /** @Output() **/
  activeTabIdChange = output<T>();

  /** @Input() **/
  tabTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  @HostBinding('class.shrink') @Input() shrink: boolean = false;
  @HostBinding('class.tab-mode-buttons') isTabModeButtons: boolean = true;
  @HostBinding('class.tab-mode-tabs') isTabModeTabs: boolean = false;

  private effectModeChange = effect(() => {
    const tabMode = this.tabMode();
    this.isTabModeButtons = tabMode === 'buttons';
    this.isTabModeTabs = tabMode === 'tabs';
  });

  selectTab(tab: Tab<T>): void {
    this.activeTabIdChange.emit(tab.id);
  }

  updatePagination(): void {
    this.tabBar()!.updatePagination();
  }
}
