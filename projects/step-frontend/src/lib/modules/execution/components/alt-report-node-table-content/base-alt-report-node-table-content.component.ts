import { AfterViewInit, Component, DestroyRef, inject, Signal } from '@angular/core';
import {
  arrayToRegex,
  DateUtilsService,
  FilterConditionFactoryService,
  ItemsPerPageService,
  TableRemoteDataSource,
  TableSearch,
  DateRange,
} from '@exense/step-core';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, combineLatest } from 'rxjs';
import { DateTime } from 'luxon';

const VIEW_PAGE_SIZE = 10;
const PRINT_PAGE_SIZE = 50_000;

@Component({
  template: '',
})
export abstract class BaseAltReportNodeTableContentComponent implements ItemsPerPageService, AfterViewInit {
  private _state = inject(AltReportNodesStateService);
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  private _destroyRef = inject(DestroyRef);
  private _dateUtils = inject(DateUtilsService);
  protected readonly _mode = inject(VIEW_MODE);

  protected abstract tableSearch: Signal<TableSearch | undefined>;

  readonly dataSource$ = this._state.datasource$;

  private isRemoteDataSource$ = this.dataSource$.pipe(map((dataSource) => dataSource instanceof TableRemoteDataSource));

  ngAfterViewInit(): void {
    this.setupFilters();
  }

  getItemsPerPage(loadedUserPreferences: (itemsPerPage: number) => void): number[] {
    const allowedPageSize = this._mode === ViewMode.PRINT ? PRINT_PAGE_SIZE : VIEW_PAGE_SIZE;
    return [allowedPageSize];
  }

  private setupFilters(): void {
    this._state.search$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      this.tableSearch()?.onSearch('name', value);
    });

    this._state.selectedStatuses$
      .pipe(
        map((statuses) => arrayToRegex(Array.from(statuses))),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((statuses) => {
        this.tableSearch()?.onSearch('status', { value: statuses, regex: true });
      });

    combineLatest([this._state.dateRange$, this.isRemoteDataSource$])
      .pipe(
        map(([pickerSelection, isRemote]) => {
          const absoluteSelection = pickerSelection.absoluteSelection!;
          const dateRange: DateRange = {
            start: DateTime.fromMillis(absoluteSelection.from),
            end: DateTime.fromMillis(absoluteSelection.to),
          };
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
        this.tableSearch()?.onSearch('executionTime', searchValue);
      });
  }
}
