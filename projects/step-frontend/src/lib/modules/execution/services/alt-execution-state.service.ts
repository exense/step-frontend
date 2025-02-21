import { Observable } from 'rxjs';
import { Execution, Operation, ReportNode, TableDataSource, TimeRange, TimeSeriesErrorEntry } from '@exense/step-core';
import { KeywordParameters } from '../shared/keyword-parameters';
import { TimeRangePickerSelection } from '../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Status } from '../../_common/shared/status.enum';

export abstract class AltExecutionStateService {
  abstract readonly timeRangeSelection$: Observable<TimeRangePickerSelection>;
  abstract timeRangeOptions: TimeRangePickerSelection[];
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly isFullRangeSelected$: Observable<boolean>;
  abstract readonly keywordParameters$: Observable<KeywordParameters>;
  abstract readonly keywordsDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly hasTestCasesFilter$: Observable<boolean>;
  abstract readonly errorsDataSource$: Observable<TableDataSource<TimeSeriesErrorEntry>>;
  abstract readonly availableErrorTypes$: Observable<Status[]>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
  abstract readonly testCasesDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly currentOperations$: Observable<Operation[] | undefined>;
  abstract readonly timeRange$: Observable<TimeRange | undefined>;
  abstract updateTimeRangeSelection(selection: TimeRangePickerSelection): void;
  abstract selectFullRange(): void;
}
