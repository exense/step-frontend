import { Observable } from 'rxjs';
import { DateRange, Execution, ReportNode } from '@exense/step-core';
import { FormControl } from '@angular/forms';

export abstract class AltExecutionStateService {
  abstract readonly dateRangeCtrl: FormControl<DateRange | null | undefined>;
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly keywords$: Observable<ReportNode[]>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
}
