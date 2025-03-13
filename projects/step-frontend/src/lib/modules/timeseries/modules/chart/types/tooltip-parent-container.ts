import { EventEmitter } from '@angular/core';
import { TSChartSettings } from './ts-chart-settings';

export abstract class TooltipParentContainer {
  abstract settings: TSChartSettings;
  abstract lockStateChange: EventEmitter<boolean>;
  abstract chartMetadata: Record<string, any>;
  [key: string]: any;
}
