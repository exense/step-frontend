import { Observable } from 'rxjs';
import { DateRange, Execution, Operation, ReportNode, TableDataSource, TimeRange } from '@exense/step-core';
import { FormControl } from '@angular/forms';
import { KeywordParameters } from '../shared/keyword-parameters';
import { RangePickerStatesService } from './range-picker-state.service';

export abstract class AltExecutionStateService extends RangePickerStatesService {
  abstract readonly executionIdSnapshot?: string;
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly executionFulLRange$: Observable<DateRange | null | undefined>;
  abstract readonly keywordParameters$: Observable<KeywordParameters>;
  abstract readonly keywordsDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
  abstract readonly testCasesDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly currentOperations$: Observable<Operation[] | undefined>;
}
