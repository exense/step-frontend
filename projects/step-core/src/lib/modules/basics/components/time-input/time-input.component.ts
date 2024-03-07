import { Component, ViewEncapsulation } from '@angular/core';
import { TimeUnit } from '../../types/time-unit.enum';
import { BaseTimeConverterComponent } from './base-time-converter.component';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'step-time-input',
  templateUrl: './base-time-converter.component.html',
  styleUrls: ['./base-time-converter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeInputComponent extends BaseTimeConverterComponent {
  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected override calculateBaseValue(modelValue: number, modelMeasure: TimeUnit): number {
    return modelValue * modelMeasure;
  }

  protected override calculateDisplayValue(
    modelValue: number,
    modelMeasure: TimeUnit,
    displayMeasure?: TimeUnit,
  ): number {
    if (!displayMeasure) {
      return modelValue;
    }
    const ms = this.calculateBaseValue(modelValue, modelMeasure);
    return Math.round(ms / displayMeasure);
  }

  protected override calculateModelValue(
    displayValue: number,
    modelMeasure: TimeUnit,
    displayMeasure?: TimeUnit,
  ): number {
    if (!displayMeasure) {
      return displayValue;
    }
    let ms = displayValue * displayMeasure;
    return Math.round(ms / modelMeasure);
  }
}
