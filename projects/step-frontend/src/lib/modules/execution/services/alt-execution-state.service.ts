import { Observable } from 'rxjs';
import { DateRange, Execution, Operation, ReportNode, TableDataSource, TimeSeriesErrorEntry } from '@exense/step-core';
import { KeywordParameters } from '../shared/keyword-parameters';
import { RangePickerStatesService } from './range-picker-state.service';
import { Status } from '../../_common/step-common.module';

export abstract class AltExecutionStateService extends RangePickerStatesService {
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly executionFulLRange$: Observable<DateRange | null | undefined>;
  abstract readonly keywordParameters$: Observable<KeywordParameters>;
  abstract readonly keywordsDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly hasTestCasesFilter$: Observable<boolean>;
  abstract readonly errorsDataSource$: Observable<TableDataSource<TimeSeriesErrorEntry>>;
  abstract readonly availableErrorTypes$: Observable<Status[]>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
  abstract readonly testCasesDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly currentOperations$: Observable<Operation[] | undefined>;
}
