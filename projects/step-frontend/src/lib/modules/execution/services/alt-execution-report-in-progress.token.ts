import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const ALT_EXECUTION_REPORT_IN_PROGRESS = new InjectionToken<Observable<boolean>>(
  'Boolean stream, which indicates that report data preparation is in progress',
);
