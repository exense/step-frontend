import { InjectionToken } from '@angular/core';

export const PLAN_ID = new InjectionToken<() => string>('Plan Id');
