import { Observable } from 'rxjs';
import { DateRange, Execution, Operation, ReportNode, TableDataSource, TimeRange } from '@exense/step-core';
import { KeywordParameters } from '../shared/keyword-parameters';
import { TimeRangePickerSelection } from '../../timeseries/modules/_common';
import { TimeSeriesConfig } from '../../timeseries/modules/_common/types/time-series/time-series.config';

export abstract class AltExecutionStateService {
  abstract readonly timeRangeChange$: Observable<TimeRangePickerSelection>;
  abstract timeRangeOptions: TimeRangePickerSelection[];
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly isFullRangeSelected$: Observable<boolean>;
  abstract readonly keywordParameters$: Observable<KeywordParameters>;
  abstract readonly keywordsDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly hasTestCasesFilter$: Observable<boolean>;
  abstract readonly testCases$: Observable<ReportNode[] | undefined>;
  abstract readonly testCasesDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly currentOperations$: Observable<Operation[] | undefined>;
  abstract readonly timeRange$: Observable<TimeRange | undefined>;
  abstract getTimeRange(): TimeRangePickerSelection;
  abstract updateTimeRangeSelection(selection: TimeRangePickerSelection): void;
  abstract selectFullRange(): void;
}
