import { ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TimeSeriesContext } from '../../../timeseries/modules/_common';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ExecutionDashboardComponent } from '../../../timeseries/components/execution-page/execution-dashboard.component';
import { filter, pairwise } from 'rxjs';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TimeRange } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-analytics',
  templateUrl: './alt-execution-analytics.component.html',
  styleUrl: './alt-execution-analytics.component.scss',
})
export class AltExecutionAnalyticsComponent implements OnInit {
  readonly _state = inject(AltExecutionStateService);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _router = inject(Router);
  protected _cd = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private dashboardComponent = viewChild('dashboard', { read: ExecutionDashboardComponent });
  isLoading = false;

  activeTimeRangeSelection = toSignal(this._state.timeRangeSelection$);

  handleDashboardSettingsChange(context: TimeSeriesContext) {
    console.log('CONTEXT changed', context);
    this._urlParamsService.updateUrlParamsFromContext(context, this.activeTimeRangeSelection()!, undefined, false);
  }

  handleDashboardSettingsInit(context: TimeSeriesContext) {
    console.log('CONTEXT INIT', context);
    this._urlParamsService.updateUrlParamsFromContext(context, this.activeTimeRangeSelection()!, undefined, true);
  }

  getDashboardSelectionRange() {
    return this.dashboardComponent()?.getSelectedTimeRange();
  }

  ngOnInit(): void {
    this.subscribeToUrlNavigation();
  }

  handleFullRangeChangeRequest(range: TimeRange) {
    this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: range });
  }

  private subscribeToUrlNavigation() {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        pairwise(), // Gives us [previousEvent, currentEvent]
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        this.isLoading = true;
        this._cd.detectChanges();
        let params = this._urlParamsService.collectUrlParams();
        if (params.timeRange) {
          this._state.updateTimeRangeSelection(params.timeRange!);
        }
        // we need time for the time range to propagate so it doesn't trigger a change in the context
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      });
  }
}
