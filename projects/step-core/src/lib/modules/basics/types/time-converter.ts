import { TimeUnit } from './time-unit.enum';

export interface TimeConverter {
  calculateBaseValue(modelValue: number, modelMeasure: TimeUnit): number;
  calculateDisplayValue(modelValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number;
  calculateModelValue(displayValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number;
  autoDetermineDisplayMeasure(
    modelValue: number,
    modelMeasure: TimeUnit,
    allowedMeasures: TimeUnit[],
    defaultDisplayMeasure?: TimeUnit,
  ): TimeUnit;
}
