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
  standalone: true,
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
  _selectedUnit: ResolutionPickerOption = this.UNITS[0];
  _inputValue?: string;

  ngOnInit(): void {
    if (this.initialValue) {
      this.mapToClosestUnitAndValue(this.initialValue);
    }
  }

  private mapToClosestUnitAndValue(millis: number): void {
    if (millis < 1000) {
      this._inputValue = '0';
      return;
    }
    for (let i = this.UNITS.length - 1; i >= 0; i--) {
      const unit = this.UNITS[i];
      if (millis >= unit.ms) {
        const value = Math.round(millis / unit.ms);
        this._inputValue = value.toString();
        this._selectedUnit = this.UNITS[i];
        return;
      }
    }
  }

  applyResolution() {
    const isValidNumber = this._inputValue && !isNaN(parseInt(this._inputValue)) && isFinite(this._inputValue as any);
    if (isValidNumber) {
      let numberValue = parseInt(this._inputValue!);
      this.resolutionChange.emit(this._selectedUnit.ms * numberValue);
    } else {
      this.resolutionChange.emit(0);
    }
  }
}
