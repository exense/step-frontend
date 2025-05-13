import { AfterViewInit, Component, DestroyRef, inject, Signal } from '@angular/core';
import {
  arrayToRegex,
  DateUtilsService,
  FilterConditionFactoryService,
  ItemsPerPageService,
  TableRemoteDataSource,
  TableSearch,
  DateRange,
  ArtefactClass,
} from '@exense/step-core';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, combineLatest } from 'rxjs';
import { ReportNodeType } from '../../../report-nodes/shared/report-node-type.enum';

const VIEW_PAGE_SIZE = 100;
const PRINT_PAGE_SIZE = 50_000;

const ARTEFACT_REPORT_NODE_MAP: Record<string, string> = {
  [ArtefactClass.KEYWORD]: ReportNodeType.CALL_FUNCTION_REPORT_NODE,
  [ArtefactClass.TEST_CASE]: ReportNodeType.TEST_CASE_REPORT_NODE,
  [ArtefactClass.SLEEP]: ReportNodeType.SLEEP_REPORT_NODE,
  [ArtefactClass.ECHO]: ReportNodeType.ECHO_REPORT_NODE,
  [ArtefactClass.WAIT_FOR_EVENT]: ReportNodeType.WAIT_FOR_EVENT_REPORT_NODE,
  [ArtefactClass.THREAD_GROUP]: ReportNodeType.THREAD_REPORT_NODE,
  [ArtefactClass.FOR]: ReportNodeType.FOR_REPORT_NODE,
};

@Component({
  template: '',
})
export abstract class BaseAltReportNodeTableContentComponent implements ItemsPerPageService, AfterViewInit {
  protected _state = inject(AltReportNodesStateService);
  protected _filterConditionFactory = inject(FilterConditionFactoryService);
  protected _destroyRef = inject(DestroyRef);
  protected _dateUtils = inject(DateUtilsService);
  protected readonly _mode = inject(VIEW_MODE);

  protected abstract tableSearch: Signal<TableSearch | undefined>;

  readonly dataSource$ = this._state.datasource$;

  private isRemoteDataSource$ = this.dataSource$.pipe(map((dataSource) => dataSource instanceof TableRemoteDataSource));

  ngAfterViewInit(): void {
    this.setupSearchFilter();
    this.setupStatusesFilter();
    this.setupReportNodeClassFilter();
    this.setupDateRangeFilter();
  }

  getItemsPerPage(loadedUserPreferences: (itemsPerPage: number) => void): number[] {
    const allowedPageSize = this._mode === ViewMode.PRINT ? PRINT_PAGE_SIZE : VIEW_PAGE_SIZE;
    return [allowedPageSize];
  }

  protected setupSearchFilter(): void {
    this._state.search$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      this.tableSearch()?.onSearch?.('name', value);
    });
  }

  protected setupStatusesFilter(): void {
    this._state.selectedStatuses$
      .pipe(
        map((statuses) => arrayToRegex(Array.from(statuses))),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((statuses) => {
        this.tableSearch()?.onSearch?.('status', { value: statuses, regex: true });
      });
  }

  protected setupReportNodeClassFilter(): void {
    this._state.artefactClass$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((artefactClass) => {
      const reportNodeClasses = artefactClass?.map((item) => ARTEFACT_REPORT_NODE_MAP[item])?.filter((item) => !!item);

      this.tableSearch()?.onSearch?.(
        '_class',
        !!reportNodeClasses ? this._filterConditionFactory.arrayFilterCondition(reportNodeClasses) : '',
      );
    });
  }

  protected setupDateRangeFilter(): void {
    combineLatest([this._state.dateRange$, this.isRemoteDataSource$])
      .pipe(
        map(([range, isRemote]) => {
          const dateRange: DateRange = this._dateUtils.timeRange2DateRange(range)!;

          if (isRemote) {
            // Remote dataSource test case
            return this._filterConditionFactory.dateRangeFilterCondition(dateRange);
          }
          // Local dataSource test case
          const timeRange = this._dateUtils.dateRange2TimeRange(dateRange);
          return timeRange ? `${timeRange.from}|${timeRange.to}` : '';
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((searchValue) => {
        if (typeof searchValue === 'string') {
          this.tableSearch()?.onSearch?.('executionTime', searchValue, true, false);
        } else {
          this.tableSearch()?.onSearch?.('executionTime', searchValue, false);
        }
      });
  }
}
