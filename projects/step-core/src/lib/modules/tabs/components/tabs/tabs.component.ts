import {
  Component,
  computed,
  contentChild,
  inject,
  input,
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
import { TestIdDirective } from '../../../../directives/test-id.directive';

@Component({
  selector: 'step-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [StepMaterialModule, CommonModule, RouterModule, TestIdDirective],
  standalone: true,
  exportAs: 'StepTabs',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.shrink]': 'shrink()',
    '[class.tab-mode-buttons]': 'isTabModeButtons()',
    '[class.tab-mode-tabs]': 'isTabModeTabs()',
  },
})
export class TabsComponent<T extends string | number> {
  readonly _activatedRoute = inject(ActivatedRoute, { optional: true });

  private tabBar = viewChild(MatTabNav);

  readonly tabMode = input<'buttons' | 'tabs'>('buttons');

  readonly userRouteLinks = input(false);

  readonly disablePagination = input(false);

  readonly tabs = input<Tab<T>[]>([]);

  readonly activeTabId = input<T | undefined>();
  readonly activeTabIdChange = output<T>();

  readonly compactTabs = input<boolean>(false);

  readonly tabTemplateInput = input<TemplateRef<unknown> | undefined>(undefined, {
    alias: 'tabTemplate',
  });

  private tabTemplateDirective = contentChild(TabTemplateDirective);

  readonly tabTemplate = computed(() => this.tabTemplateDirective()?.templateRef ?? this.tabTemplateInput()!);

  readonly shrink = input(false);
  protected readonly isTabModeButtons = computed(() => this.tabMode() === 'buttons');
  protected readonly isTabModeTabs = computed(() => this.tabMode() === 'tabs');

  selectTab(tab: Tab<T>): void {
    this.activeTabIdChange.emit(tab.id);
  }

  updatePagination(): void {
    this.tabBar()!.updatePagination();
  }
}
