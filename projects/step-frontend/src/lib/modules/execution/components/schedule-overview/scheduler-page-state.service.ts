import { Observable } from 'rxjs';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { Execution, TableFetchLocalDataSource, TimeRange, TimeSeriesErrorEntry } from '@exense/step-core';
import { FilterBarItem } from '../../../timeseries/modules/_common';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { TSChartSettings } from '../../../timeseries/modules/chart';
import { Signal } from '@angular/core';

export abstract class SchedulerPageStateService {
  readonly LAST_EXECUTIONS_TO_DISPLAY = 30;
  abstract readonly timeRangeSelection$: Observable<TimeRangePickerSelection>;
  abstract readonly timeRange$: Observable<TimeRange>;
  abstract updateTimeRangeSelection(selection: TimeRangePickerSelection): void;
  abstract updateRefreshInterval(interval: number): void;
  abstract taskId: Signal<string>;
  abstract refreshInterval: Signal<number>;

  // charts data
  abstract readonly summaryData$: Observable<ReportNodeSummary>;
  abstract readonly executionsChartSettings$: Observable<TSChartSettings>;
  abstract readonly keywordsChartSettings$: Observable<{ chartSettings: TSChartSettings; lastExecutions: Execution[] }>;
  abstract readonly testCasesChartSettings$: Observable<{
    chartSettings: TSChartSettings | null;
    lastExecutions: Execution[];
  }>;
  abstract readonly errorsDataSource: TableFetchLocalDataSource<TimeSeriesErrorEntry>;

  abstract getDashboardFilters(): FilterBarItem[];
}
