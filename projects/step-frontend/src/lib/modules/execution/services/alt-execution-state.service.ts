import { Observable } from 'rxjs';
import { DateRange, Execution, Operation, ReportNode, TableDataSource, TimeRange } from '@exense/step-core';
import { FormControl } from '@angular/forms';
import { KeywordParameters } from '../shared/keyword-parameters';

export abstract class AltExecutionStateService {
  abstract readonly dateRangeCtrl: FormControl<DateRange | null | undefined>;
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly executionFulLRange$: Observable<DateRange | null | undefined>;
  abstract readonly isFullRangeSelected$: Observable<boolean>;
  abstract readonly keywordParameters$: Observable<KeywordParameters>;
  abstract readonly keywordsDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly hasTestCasesFilter$: Observable<boolean>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
  abstract readonly testCasesDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly currentOperations$: Observable<Operation[] | undefined>;
  abstract readonly dateRange$: Observable<DateRange | undefined>;
  abstract readonly timeRange$: Observable<TimeRange | undefined>;
  abstract updateRange(timeRange: TimeRange | null | undefined): void;
  abstract updateRelativeTime(time?: number): void;
  abstract selectFullRange(): void;
}
