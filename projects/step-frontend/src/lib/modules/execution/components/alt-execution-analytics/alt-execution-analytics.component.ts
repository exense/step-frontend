import { Component, ElementRef, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { TimeSeriesContext } from '../../../timeseries/modules/_common';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExecutionDashboardComponent } from '../../../timeseries/components/execution-page/execution-dashboard.component';

@Component({
  selector: 'step-alt-execution-analytics',
  templateUrl: './alt-execution-analytics.component.html',
  styleUrl: './alt-execution-analytics.component.scss',
})
export class AltExecutionAnalyticsComponent implements OnInit, OnDestroy {
  readonly _state = inject(AltExecutionStateService);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private dashboardComponent = viewChild('dashboard', { read: ExecutionDashboardComponent });

  activeTimeRangeSelection = toSignal(this._state.timeRangeSelection$);

  handleDashboardSettingsChange(context: TimeSeriesContext) {
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
    this._state.setAnalyticsViewReference(this);
  }

  ngOnDestroy(): void {
    this._state.setAnalyticsViewReference(undefined);
  }
}
