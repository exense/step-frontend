import { InjectionToken } from '@angular/core';

export const EXECUTION_ID = new InjectionToken<() => string>('Execution Id');
