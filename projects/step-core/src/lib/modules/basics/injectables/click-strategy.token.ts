import { InjectionToken } from '@angular/core';
import { ClickStrategyType } from '../types/click-strategy.type';

export const CLICK_STRATEGY = new InjectionToken<ClickStrategyType>('Click strategy');
