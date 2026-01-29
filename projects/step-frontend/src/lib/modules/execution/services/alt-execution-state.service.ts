import { Observable } from 'rxjs';
import {
  AggregatedReportView,
  Execution,
  Operation,
  ReportNode,
  TableDataSource,
  TimeRange,
  TimeSeriesErrorEntry,
} from '@exense/step-core';
import { KeywordParameters } from '../shared/keyword-parameters';
import { TimeRangePickerSelection } from '../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Status } from '../../_common/shared/status.enum';
import { Signal } from '@angular/core';
import { TimeRangeExt } from '../shared/time-range-ext';

export abstract class AltExecutionStateService {
  abstract readonly timeRangeSelection$: Observable<TimeRangePickerSelection>;
  abstract timeRangeOptions: TimeRangePickerSelection[];
  abstract readonly executionId$: Observable<string>;
  abstract readonly execution$: Observable<Execution>;
  abstract readonly keywordParameters$: Observable<KeywordParameters>;
  abstract readonly keywordsDataSource$: Observable<TableDataSource<ReportNode>>;
  abstract readonly errors$: Observable<TimeSeriesErrorEntry[] | undefined>;
  abstract readonly availableErrorTypes$: Observable<Status[]>;
  abstract readonly testCases$: Observable<AggregatedReportView[] | undefined>;
  abstract readonly testCasesDataSource$: Observable<TableDataSource<AggregatedReportView>>;
  abstract readonly currentOperations$: Observable<Operation[] | undefined>;
  abstract readonly timeRange$: Observable<TimeRangeExt | undefined>;
  abstract updateTimeRangeSelection(selection: TimeRangePickerSelection): void;
  abstract selectFullRange(): void;
}
