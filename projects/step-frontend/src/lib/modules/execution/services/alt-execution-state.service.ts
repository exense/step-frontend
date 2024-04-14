import { Observable } from 'rxjs';
import { Execution, ReportNode } from '@exense/step-core';

export abstract class AltExecutionStateService {
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly keywords$: Observable<ReportNode[]>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
}
