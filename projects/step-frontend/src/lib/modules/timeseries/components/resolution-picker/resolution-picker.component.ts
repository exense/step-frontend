import { Component, EventEmitter, Output } from '@angular/core';
import { ResolutionPickerOption } from './resolution-picker-option';

@Component({
  selector: 'step-ts-resolution-picker',
  templateUrl: './resolution-picker.component.html',
  styleUrls: ['./resolution-picker.component.scss'],
})
export class ResolutionPickerComponent {
  @Output() resolutionChange = new EventEmitter<number>();
  readonly UNITS: ResolutionPickerOption[] = [
    { label: 'Seconds', ms: 1_000 },
    { label: 'Minutes', ms: 60_000 },
    { label: 'Hours', ms: 3_600_000 },
    { label: 'Days', ms: 24 * 3_600_000 },
    { label: 'Weeks', ms: 7 * 24 * 3_600_000 },
    { label: 'Months', ms: 31 * 24 * 3_600_000 },
  ];
  selectedUnit: ResolutionPickerOption = this.UNITS[0];
  inputValue?: string;

  applyResolution() {
    const isValidNumber = this.inputValue && !isNaN(parseInt(this.inputValue)) && isFinite(this.inputValue as any);
    if (isValidNumber) {
      let numberValue = parseInt(this.inputValue!);
      this.resolutionChange.emit(this.selectedUnit.ms * numberValue);
    } else {
      this.resolutionChange.emit(0);
    }
  }
}
