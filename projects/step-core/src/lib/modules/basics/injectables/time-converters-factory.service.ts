import { Injectable } from '@angular/core';
import { TimeConverter } from '../types/time-converter';
import { TimeUnit } from '../step-basics.module';

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
}
