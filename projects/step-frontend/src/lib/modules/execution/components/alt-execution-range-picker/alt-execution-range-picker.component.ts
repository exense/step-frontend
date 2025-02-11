import { Component, inject } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';

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
