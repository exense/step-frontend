import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';

export interface ResolutionPickerOption {
  label: string;
  ms: number;
}

@Component({
  selector: 'step-ts-resolution-picker',
  templateUrl: './resolution-picker.component.html',
  styleUrls: ['./resolution-picker.component.scss'],
  imports: [COMMON_IMPORTS],
})
export class ResolutionPickerComponent implements OnInit {
  @Input() initialValue?: number;

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

  ngOnInit(): void {
    if (this.initialValue) {
      this.mapToClosestUnitAndValue(this.initialValue);
    }
  }

  private mapToClosestUnitAndValue(millis: number): void {
    if (millis < 1000) {
      this.inputValue = '0';
      return;
    }
    for (let i = this.UNITS.length - 1; i >= 0; i--) {
      const unit = this.UNITS[i];
      if (millis >= unit.ms) {
        const value = Math.round(millis / unit.ms);
        this.inputValue = value.toString();
        this.selectedUnit = this.UNITS[i];
        return;
      }
    }
  }

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
