import { Component, computed, DestroyRef, forwardRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { GridLayoutExternalTabsService, GridLayoutTab } from '@exense/step-core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum ExecutionViewTabType {
  PERFORMANCE = 'performance',
  DRILLDOWN = 'drilldown',
}

export enum STATIC_TABS {
  REPORT = 'report',
  ANALYTICS = 'analytics',
}

export interface DrilldownExecutionTab {
  id: string;
  label: string;
  nodeDetailsPath: string[];
  queryParams?: Params;
}

interface ExecutionViewTab extends GridLayoutTab {
  type?: ExecutionViewTabType;
  drilldown?: DrilldownExecutionTab;
}

const PERFORMANCE_TAB: ExecutionViewTab = {
  id: STATIC_TABS.ANALYTICS,
  label: 'Performance',
  type: ExecutionViewTabType.PERFORMANCE,
};

@Component({
  selector: 'step-alt-execution-tabs',
  templateUrl: './alt-execution-tabs.component.html',
  styleUrl: './alt-execution-tabs.component.scss',
  providers: [
    {
      provide: GridLayoutExternalTabsService,
      useExisting: forwardRef(() => AltExecutionTabsComponent),
    },
  ],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class AltExecutionTabsComponent implements GridLayoutExternalTabsService<ExecutionViewTab> {
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _tabsService = inject(AltExecutionTabsService);

  private readonly currentUrl = signal(this._router.url);

  protected readonly isPerformanceActive = computed(() => {
    const currentUrl = this.currentUrl();
    const activeDrilldownTabId = this._tabsService.activeDrilldownTabId();
    return currentUrl.includes(`/${STATIC_TABS.ANALYTICS}`) && !activeDrilldownTabId;
  });

  readonly externalTabs = computed(() => {
    const drilldownExecutionTabs = this._tabsService.drilldownTabs();

    const drilldownTabs: ExecutionViewTab[] = drilldownExecutionTabs.map((drilldown) => ({
      id: drilldown.id,
      label: drilldown.label,
      type: ExecutionViewTabType.DRILLDOWN,
      drilldown,
    }));

    return [PERFORMANCE_TAB, ...drilldownTabs];
  });

  readonly externalActiveTabId = computed(() => {
    const drilldownId = this._tabsService.activeDrilldownTabId();
    const isPerformanceActive = this.isPerformanceActive();

    if (drilldownId) {
      return drilldownId;
    }
    if (isPerformanceActive) {
      return STATIC_TABS.ANALYTICS;
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
        if (!this._router.url.includes('node-details')) {
          this._tabsService.clearActiveDrilldownTab();
        }
      });
  }

  isExternalTab(tab: ExecutionViewTab): boolean {
    return !!tab.type;
  }

  selectExternalTab(tab: ExecutionViewTab): void {
    switch (tab.type) {
      case ExecutionViewTabType.PERFORMANCE:
        this.selectPerformance();
        break;
      case ExecutionViewTabType.DRILLDOWN:
        this.selectDrilldown(tab.drilldown!);
        break;
      default:
        break;
    }
  }

  selectExternalDefault(): void {
    this.selectPerformance();
  }

  cleanupExternalState(): void {
    this._tabsService.clearActiveDrilldownTab();
    this.navigateToReport();
  }

  protected closeDrilldown(tab: DrilldownExecutionTab, event: MouseEvent): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    const wasActive = this._tabsService.activeDrilldownTabId() === tab.id;
    const nextTab = this._tabsService.removeDrilldownTab(tab.id);
    if (!wasActive) {
      return;
    }
    if (this._tabsService.activeDrilldownTabId()) {
      this.navigateToDrilldown(nextTab!);
      return;
    }
    this.navigateToReport();
  }

  private selectPerformance(): void {
    this._tabsService.clearActiveDrilldownTab();
    this._router.navigate([STATIC_TABS.ANALYTICS], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  private selectDrilldown(tab: DrilldownExecutionTab): void {
    const activeTab = this._tabsService.activateDrilldownTab(tab.id);
    if (!activeTab) {
      return;
    }
    this.navigateToDrilldown(activeTab);
  }

  private navigateToDrilldown(tab: DrilldownExecutionTab): void {
    this._router.navigate(tab.nodeDetailsPath, {
      relativeTo: this._activatedRoute,
      queryParams: tab.queryParams as Params | undefined,
      queryParamsHandling: 'merge',
    });
  }

  private navigateToReport(): void {
    this._router.navigate([STATIC_TABS.REPORT], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'merge',
    });
  }

  protected readonly ExecutionViewTabType = ExecutionViewTabType;
}
