import { Component, computed, DestroyRef, forwardRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { GridLayoutExternalTabsService, GridLayoutTab, StepCoreModule } from '@exense/step-core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum CrossExecutionViewTabType {
  PERFORMANCE = 'performance',
}

enum STATIC_TABS {
  REPORT = 'report',
  PERFORMANCE = 'performance',
}

interface CrossExecutionTab extends GridLayoutTab {
  type?: CrossExecutionViewTabType;
}

const PERFORMANCE_TAB: CrossExecutionTab = {
  id: STATIC_TABS.PERFORMANCE,
  label: 'Performance',
  type: CrossExecutionViewTabType.PERFORMANCE,
};

@Component({
  selector: 'step-cross-execution-tabs',
  imports: [StepCoreModule],
  templateUrl: './cross-execution-tabs.component.html',
  styleUrl: './cross-execution-tabs.component.scss',
  providers: [
    {
      provide: GridLayoutExternalTabsService,
      useExisting: forwardRef(() => CrossExecutionTabsComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CrossExecutionTabsComponent implements GridLayoutExternalTabsService<CrossExecutionTab> {
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  private readonly currentUrl = signal(this._router.url);

  private readonly isPerformanceActive = computed(() => {
    const currentUrl = this.currentUrl();
    return currentUrl.includes(`/${STATIC_TABS.PERFORMANCE}`);
  });

  readonly externalTabs = computed(() => [PERFORMANCE_TAB]);
  readonly externalActiveTabId = computed(() => {
    const isPerformanceActive = this.isPerformanceActive();
    if (isPerformanceActive) {
      return STATIC_TABS.PERFORMANCE;
    }
    return undefined;
  });

  constructor() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.currentUrl.set(this._router.url);
      });
  }

  isExternalTab(tab: CrossExecutionTab): boolean {
    return !!tab.type;
  }

  selectExternalTab(tab: CrossExecutionTab): void {
    switch (tab.type) {
      case CrossExecutionViewTabType.PERFORMANCE:
        this.navigateToPerformance();
        break;
      default:
        break;
    }
  }

  cleanupExternalState(): void {
    this.navigateToReport();
  }

  selectExternalDefault(): void {
    this.navigateToPerformance();
  }

  private navigateToPerformance(): void {
    this._router.navigate([STATIC_TABS.PERFORMANCE], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  private navigateToReport(): void {
    this._router.navigate([STATIC_TABS.REPORT], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  protected readonly CrossExecutionViewTabType = CrossExecutionViewTabType;
}
