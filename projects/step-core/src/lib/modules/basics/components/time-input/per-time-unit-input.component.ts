import { TimeUnit } from '../../shared/time-unit.enum';
import { BaseTimeConverterComponent } from './base-time-converter.component';
import { Component, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'step-per-time-unit-input',
  templateUrl: './base-time-converter.component.html',
  styleUrls: ['./base-time-converter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PerTimeUnitInputComponent extends BaseTimeConverterComponent {
  protected override separator = 'per';

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected calculateDisplayValue(modelValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return modelValue;
    }
    const units = modelValue / modelMeasure;
    return Math.round(units / displayMeasure);
  }

  protected calculateModelValue(displayValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return displayValue;
    }
    const units = displayValue / displayMeasure;
    return units * modelMeasure;
  }
}
