import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { BehaviorSubject } from 'rxjs';
import { TimeRangePickerSelection, TimeSeriesConfig } from '../../../timeseries/modules/_common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { AltExecutionStorageService, ExecutionContext } from '../../services/alt-execution-storage.service';
import { Execution } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-range-picker',
  templateUrl: './alt-execution-range-picker.component.html',
  styleUrl: './alt-execution-range-picker.component.scss',
})
export class AltExecutionRangePickerComponent {
  protected readonly _state = inject(AltExecutionStateService);

  constructor() {}

  handleSelectionChange(selection: TimeRangePickerSelection) {
    this._state.updateTimeRangeSelection(selection);
  }
}
