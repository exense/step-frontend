import { Component, inject, OnInit } from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { BehaviorSubject } from 'rxjs';
import { TimeRangePickerSelection, TimeSeriesConfig } from '../../../timeseries/modules/_common';

@Component({
  selector: 'step-alt-execution-range-picker',
  templateUrl: './alt-execution-range-picker.component.html',
  styleUrl: './alt-execution-range-picker.component.scss',
})
export class AltExecutionRangePickerComponent implements OnInit {
  protected readonly _state = inject(AltExecutionStateService);

  timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'FULL' },
    ...TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS,
  ];

  ngOnInit(): void {
    this._state.execution$.subscribe((execution) => {
      this.timeRangeOptions[0].absoluteSelection = { from: execution.startTime!, to: execution.endTime || 0 };
    });
  }

  handleSelectionChange(selection: TimeRangePickerSelection) {
    if (selection.type === 'RELATIVE') {
      let time = selection.relativeSelection!.timeInMs;
      let now = new Date().getTime() - 5000;
      selection.absoluteSelection = { from: now - time, to: now };
    }
    this._state.updateTimeRangeSelection(selection);
  }
}
