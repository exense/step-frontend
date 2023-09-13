import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TimeSeriesConfig } from '../../time-series.config';
import { ResolutionPickerOption } from './resolution-picker-option';

@Component({
  selector: 'step-ts-resolution-picker',
  templateUrl: './resolution-picker.component.html',
  styleUrls: ['./resolution-picker.component.scss'],
})
export class ResolutionPickerComponent {
  @Output() onResolutionChange = new EventEmitter<number>();
  options: ResolutionPickerOption[] = TimeSeriesConfig.DEFAULT_RESOLUTION_OPTIONS;

  selectResolution(option: ResolutionPickerOption) {
    this.onResolutionChange.emit(option.valueMs);
  }
}
