import { Injectable } from '@angular/core';
import { TimeConverter } from '../types/time-converter';
import { TimeUnit } from '../step-basics.module';

/*
 * This calculates the best fitting timeUnit for a given number of milliseconds
 *
 * TODO: we should instead save the timeUnit in the BE and remove this. (Lucian: timeseries work only with ms, so this is useful)
 */
const autoDetermineDisplayMeasure = (
  modelValue: number,
  modelMeasure: TimeUnit,
  allowedMeasures: TimeUnit[],
  defaultDisplayMeasure?: TimeUnit,
): TimeUnit => {
  const baseValue = modelValue * modelMeasure;
  const allowed = [...allowedMeasures].sort((a, b) => b - a);
  const defaultValue = defaultDisplayMeasure ?? allowed[allowed.length - 1];
  if (!baseValue) {
    return defaultValue;
  }
  for (const unit of allowed) {
    if (baseValue % unit === 0 && baseValue / unit >= 1) {
      return unit;
    }
  }

  return defaultValue;
};

@Injectable({
  providedIn: 'root',
})
export class TimeConvertersFactoryService {
  timeConverter(): TimeConverter {
    return new NormalTimerConverter();
  }

  perTimeConverter(): TimeConverter {
    return new PerTimeConverter();
  }
}

class NormalTimerConverter implements TimeConverter {
  calculateBaseValue(modelValue: number, modelMeasure: TimeUnit): number {
    return modelValue * modelMeasure;
  }

  calculateDisplayValue(modelValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return modelValue;
    }
    const ms = this.calculateBaseValue(modelValue, modelMeasure);
    return Math.round(ms / displayMeasure);
  }

  calculateModelValue(displayValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return displayValue;
    }
    let ms = displayValue * displayMeasure;
    return Math.round(ms / modelMeasure);
  }

  autoDetermineDisplayMeasure(
    modelValue: number,
    modelMeasure: TimeUnit,
    allowedMeasures: TimeUnit[],
    defaultDisplayMeasure?: TimeUnit,
  ): TimeUnit {
    return autoDetermineDisplayMeasure(modelValue, modelMeasure, allowedMeasures, defaultDisplayMeasure);
  }
}

class PerTimeConverter implements TimeConverter {
  calculateBaseValue(modelValue: number, modelMeasure: TimeUnit): number {
    return modelValue / modelMeasure;
  }

  calculateDisplayValue(modelValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return modelValue;
    }
    const units = this.calculateBaseValue(modelValue, modelMeasure);
    return Math.round(units / displayMeasure);
  }

  calculateModelValue(displayValue: number, modelMeasure: TimeUnit, displayMeasure?: TimeUnit): number {
    if (!displayMeasure) {
      return displayValue;
    }
    const units = displayValue / displayMeasure;
    return units * modelMeasure;
  }

  autoDetermineDisplayMeasure(
    modelValue: number,
    modelMeasure: TimeUnit,
    allowedMeasures: TimeUnit[],
    defaultDisplayMeasure?: TimeUnit,
  ): TimeUnit {
    return autoDetermineDisplayMeasure(modelValue, modelMeasure, allowedMeasures, defaultDisplayMeasure);
  }
}
