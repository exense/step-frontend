import { Component, inject } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';

@Component({
  selector: 'step-alt-execution-analytics',
  templateUrl: './alt-execution-analytics.component.html',
  styleUrl: './alt-execution-analytics.component.scss',
})
export class AltExecutionAnalyticsComponent {
  readonly _state = inject(AltExecutionStateService);

  handlePickerTimeRangeChange(selection: TimeRangePickerSelection) {
    this._state.updateTimeRangeSelection(selection);
  }
}
