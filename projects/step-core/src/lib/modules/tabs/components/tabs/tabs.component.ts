import {
  Component,
  computed,
  contentChild,
  effect,
  HostBinding,
  inject,
  input,
  Input,
  output,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Tab } from '../../shared/tab';
import { MatTabNav } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { CommonModule } from '@angular/common';
import { TabTemplateDirective } from '../directives/tab-template.directive';

@Component({
  selector: 'step-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [StepMaterialModule, CommonModule, RouterModule],
  standalone: true,
  exportAs: 'StepTabs',
  encapsulation: ViewEncapsulation.None,
})
export class TabsComponent<T extends string | number> {
  readonly _activatedRoute = inject(ActivatedRoute, { optional: true });

  /** @ViewChild(MatTabNav) **/
  private tabBar = viewChild(MatTabNav);

  /** @Input() **/
  tabMode = input<'buttons' | 'tabs'>('buttons');

  /** @Input() **/
  userRouteLinks = input(false);

  /** @Iput() **/
  disablePagination = input(false);

  /** @Input() **/
  tabs = input<Tab<T>[]>([]);

  /** @Input() **/
  activeTabId = input<T | undefined>();

  /** @Input() **/
  compactTabs = input<boolean>(false);

  /** @Output() **/
  activeTabIdChange = output<T>();

  /** @Input('tabTemplate') **/
  tabTemplateInput = input<TemplateRef<unknown> | undefined>(undefined, {
    alias: 'tabTemplate',
  });

  /** @ContentChild(TabTemplateDirective) **/
  private tabTemplateDirective = contentChild(TabTemplateDirective);

  readonly tabTemplate = computed(() => this.tabTemplateDirective()?.templateRef ?? this.tabTemplateInput()!);

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
