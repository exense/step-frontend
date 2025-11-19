import { Component, computed, DestroyRef, inject, model, OnInit, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StepCoreModule, Tab, TabsComponent } from '@exense/step-core';
import { distinctUntilChanged, filter } from 'rxjs';
import { ExecutionModule } from '../../../execution/execution.module';
import { PlanArtefactListComponent } from './plan-artefact-list/plan-artefact-list.component';
import { PlanFunctionListComponent } from './plan-function-list/plan-function-list.component';
import { PlanOtherplanListComponent } from './plan-otherplan-list/plan-otherplan-list.component';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { KeywordCallsComponent } from '../../../execution/components/keyword-calls/keyword-calls.component';

export type PlanControlsTab = 'controls' | 'keywords' | 'other' | 'console';

const TABS = {
  controls: { id: 'controls', label: 'Controls' } as Tab<PlanControlsTab>,
  keywords: { id: 'keywords', label: 'Keywords' } as Tab<PlanControlsTab>,
  other: { id: 'other', label: 'Other Plans' } as Tab<PlanControlsTab>,
  console: { id: 'console', label: 'Console' } as Tab<PlanControlsTab>,
};

@Component({
  selector: 'step-plan-controls',
  imports: [
    StepCoreModule,
    ExecutionModule,
    PlanArtefactListComponent,
    PlanFunctionListComponent,
    PlanOtherplanListComponent,
  ],
  templateUrl: './plan-controls.component.html',
  styleUrl: './plan-controls.component.scss',
})
export class PlanControlsComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  protected readonly _interactiveSession = inject(InteractiveSessionService);

  private tabs = viewChild('tabs', { read: TabsComponent });
  private keywordCalls = viewChild('keywordCalls', { read: KeywordCallsComponent });

  readonly addControl = output<string>();
  readonly addKeywords = output<string[]>();
  readonly addPlans = output<string[]>();

  protected readonly selectedTab = model<PlanControlsTab>('controls');
  protected readonly componentTabs = signal<Tab<PlanControlsTab>[]>([TABS.controls, TABS.keywords, TABS.other]);

  private hasConsoleTab = computed(() => {
    const tabs = this.componentTabs();
    return tabs.some((tab) => tab.id === TABS.console.id);
  });

  ngOnInit(): void {
    this.initConsoleTabToggle();
  }

  updateTabsPagination(): void {
    this.tabs()?.updatePagination?.();
  }

  reloadConsoleLog(): void {
    this.keywordCalls()?._leafReportsDataSource?.reload?.();
  }

  setTab(tab: PlanControlsTab): void {
    this.selectedTab.set(tab);
  }

  private initConsoleTabToggle(): void {
    this._interactiveSession.isActive$
      .pipe(
        filter((shouldConsoleExists) => {
          const hasConsole = this.hasConsoleTab();
          return hasConsole !== shouldConsoleExists;
        }),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((withConsole) => {
        this.componentTabs.update((tabs) => {
          if (withConsole) {
            return [...tabs, TABS.console];
          }
          return tabs.filter((tab) => tab.id !== TABS.console.id);
        });
        if (withConsole) {
          this.selectedTab.set(TABS.console.id);
        }
      });
  }
}
