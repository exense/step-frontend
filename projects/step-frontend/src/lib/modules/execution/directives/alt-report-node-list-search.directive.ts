import { Directive, inject } from '@angular/core';
import {
  ArtefactClass,
  DateRange,
  DateUtilsService,
  FilterCondition,
  FilterConditionFactoryService,
  TableRemoteDataSource,
  TableSearchParams,
} from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, map, tap } from 'rxjs';
import { ReportNodeType } from '../../report-nodes/shared/report-node-type.enum';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { AltExecutionStateService } from '../services/alt-execution-state.service';

const ARTEFACT_REPORT_NODE_MAP: Record<string, string> = {
  [ArtefactClass.KEYWORD]: ReportNodeType.CALL_FUNCTION_REPORT_NODE,
  [ArtefactClass.TEST_CASE]: ReportNodeType.TEST_CASE_REPORT_NODE,
  [ArtefactClass.SLEEP]: ReportNodeType.SLEEP_REPORT_NODE,
  [ArtefactClass.ECHO]: ReportNodeType.ECHO_REPORT_NODE,
  [ArtefactClass.WAIT_FOR_EVENT]: ReportNodeType.WAIT_FOR_EVENT_REPORT_NODE,
  [ArtefactClass.THREAD_GROUP]: ReportNodeType.THREAD_REPORT_NODE,
  [ArtefactClass.FOR]: ReportNodeType.FOR_REPORT_NODE,
};

@Directive({
  selector: '[stepAltReportNodeListSearch]',
})
export class AltReportNodeListSearchDirective {
  private _state = inject(AltReportNodesStateService);
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  private _dateUtils = inject(DateUtilsService);
  private _executionState = inject(AltExecutionStateService);

  private initialDateRangeLoadPending = true;

  private isRemoteDataSource$ = this._state.datasource$.pipe(
    map((dataSource) => dataSource instanceof TableRemoteDataSource),
  );

  readonly searchName$ = this._state.search$.pipe(takeUntilDestroyed());

  readonly searchStatuses$ = this._state.selectedStatuses$.pipe(
    map((statuses) => Array.from(statuses)),
    map((statuses) => this._filterConditionFactory.inFilterCondition(statuses)),
    takeUntilDestroyed(),
  );

  readonly searchReportNodeClass$ = this._state.artefactClass$.pipe(
    map((artefactClass) => artefactClass?.map((item) => ARTEFACT_REPORT_NODE_MAP[item])?.filter((item) => !!item)),
    map((reportNodeClasses) =>
      !!reportNodeClasses ? this._filterConditionFactory.arrayFilterCondition(reportNodeClasses) : '',
    ),
    takeUntilDestroyed(),
  );

  readonly dateRange$ = this._executionState.timeRange$;

  readonly searchDateRange$ = combineLatest([this.dateRange$, this.isRemoteDataSource$]).pipe(
    map(([range, isRemote]) => {
      let searchValue: string | FilterCondition<unknown>;
      if (isRemote) {
        // Remote dataSource test case
        const dateRange: DateRange = this._dateUtils.timeRange2DateRange(range)!;
        searchValue = this._filterConditionFactory.dateRangeFilterCondition(dateRange);
      } else {
        // Local dataSource test case
        searchValue = range ? `${range.from}|${range.to}` : '';
      }
      const isManualChange = !!range?.isManualChange;
      return { searchValue, isManualChange };
    }),
    map(({ searchValue, isManualChange }) => {
      const isInitialDateRangeLoad = this.initialDateRangeLoadPending;
      const isForce = isInitialDateRangeLoad || isManualChange;
      const hideProgress = !isForce;
      const params: TableSearchParams = { resetPagination: false, isForce, hideProgress };
      return { searchValue, params };
    }),
    tap(() => (this.initialDateRangeLoadPending = false)),
    takeUntilDestroyed(),
  );
}
