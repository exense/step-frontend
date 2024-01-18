import { TimeRange } from '@exense/step-core';
import { Observable } from 'rxjs';

export interface Dashlet {
  refresh(): Observable<any>;
}
