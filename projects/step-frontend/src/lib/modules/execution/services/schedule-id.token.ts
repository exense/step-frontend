import { InjectionToken } from '@angular/core';

export const SCHEDULE_ID = new InjectionToken<() => string>('Schedule Id');
