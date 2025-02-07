import { Component, inject } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common';

@Component({
  selector: 'step-alt-execution-analytics',
  templateUrl: './alt-execution-analytics.component.html',
  styleUrl: './alt-execution-analytics.component.scss',
})
export class AltExecutionAnalyticsComponent {
  readonly _state = inject(AltExecutionStateService);

  handlePickerTimeRangeChange(selection: TimeRangePickerSelection) {
    if (selection.type === 'RELATIVE') {
      let time = selection.relativeSelection!.timeInMs;
      let now = new Date().getTime() - 5000;
      selection.absoluteSelection = { from: now - time, to: now };
    }
    this._state.updateTimeRangeSelection(selection);
  }
}
