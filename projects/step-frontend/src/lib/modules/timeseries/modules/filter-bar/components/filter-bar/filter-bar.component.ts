import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { debounceTime, Observable, Subject, take } from 'rxjs';
import {
  Execution,
  OQLVerifyResponse,
  Tab,
  TimeRange,
  TimeSeriesFilterItem,
  TimeSeriesService,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import {
  COMMON_IMPORTS,
  DiscoverComponent,
  DiscoverDialogData,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  OQLBuilder,
  TimeRangePickerComponent,
  TimeRangePickerSelection,
  TimeSeriesConfig,
  TimeSeriesContext,
  TsFilteringMode,
  TsFilteringSettings,
  TsGroupingComponent,
} from '../../../_common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerformanceViewTimeSelectionComponent } from '../perfomance-view-time-selection/performance-view-time-selection.component';
import { FilterBarItemComponent } from '../filter-bar-item/filter-bar-item.component';

const ATTRIBUTES_REMOVAL_FUNCTION = (field: string) => {
  if (field.startsWith('attributes.')) {
    return field.replace('attributes.', '');
  } else {
    return field;
  }
};

/**
 * @deprecated
 */
@Component({
  selector: 'step-ts-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    PerformanceViewTimeSelectionComponent,
    TimeRangePickerComponent,
    TsGroupingComponent,
    FilterBarItemComponent,
  ],
})
export class FilterBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() context!: TimeSeriesContext;
  @Input() activeFilters: FilterBarItem[] = [];
  @Input() activeGrouping = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS[0].attributes;
  @Input() compactView = false;

  @Input() timeRangeOptions!: TimeRangePickerSelection[];
  @Input() activeTimeRange!: TimeRangePickerSelection;

  @Input() filterOptions: FilterBarItem[] = [];
  _unusedFilterOptions: FilterBarItem[] = [];

  @Output() timeRangeChange = new EventEmitter<{ selection: TimeRangePickerSelection; triggerRefresh: boolean }>();

  @ViewChild(PerformanceViewTimeSelectionComponent) timeSelection?: PerformanceViewTimeSelectionComponent;

  @ViewChildren(FilterBarItemComponent) filterComponents?: QueryList<FilterBarItemComponent>;
  @ViewChildren('appliedFilter', { read: ElementRef }) appliedFilters?: QueryList<ElementRef<HTMLElement>>;

  private emitFilterChange$ = new Subject<void>();

  readonly EMIT_DEBOUNCE_TIME = 300;

  rawMeasurementsModeActive = false;

  readonly FilterBarItemType = FilterBarItemType;

  readonly modes: Tab<TsFilteringMode>[] = [
    {
      id: TsFilteringMode.STANDARD,
      label: 'Basic',
    },
    {
      id: TsFilteringMode.OQL,
      label: 'OQL',
    },
  ];

  readonly TsFilteringMode = TsFilteringMode;

  activeMode = TsFilteringMode.STANDARD;

  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;

  oqlModeActive = false;
  oqlValue: string = '';
  invalidOql = false;

  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _timeSeriesService = inject(TimeSeriesService);
  private _matDialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is mandatory');
    }
    if (this.context.getGroupDimensions()) {
      this.activeGrouping = this.context.getGroupDimensions();
    }
    this.emitFilterChange$.pipe(debounceTime(this.EMIT_DEBOUNCE_TIME)).subscribe(() => {
      this.composeAndVerifyFullOql(this.activeGrouping).subscribe((response) => {
        this.rawMeasurementsModeActive = response.hasUnknownFields;
        if (!this.rawMeasurementsModeActive) {
          this.emitFiltersChange();
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const filterOptions = changes['filterOptions']?.currentValue;
    if (filterOptions) {
      this.collectUnusedFilterOptions();
    }
  }

  private collectUnusedFilterOptions() {
    const filterItemsByAttribute: Record<string, FilterBarItem> = {};
    this.activeFilters.forEach((item) => (filterItemsByAttribute[item.attributeName] = item));
    this._unusedFilterOptions = this.filterOptions.filter((option) => !filterItemsByAttribute[option.attributeName]);
  }

  getValidFilters(): FilterBarItem[] {
    return this.activeFilters.filter(FilterUtils.filterItemIsValid);
  }

  handleOqlChange(event: any) {
    this.invalidOql = false;
  }

  toggleOQLMode(mode: number): void {
    this.activeMode = mode as TsFilteringMode;
    if (this.activeMode === TsFilteringMode.OQL) {
      this.oqlValue = FilterUtils.filtersToOQL(
        this.getValidFilters().filter((item) => !item.isHidden),
        TimeSeriesConfig.ATTRIBUTES_PREFIX,
      );
    } else {
      this.invalidOql = false;
    }
  }

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeChange.next({ selection, triggerRefresh: true });
  }

  composeAndVerifyFullOql(groupDimensions: string[]): Observable<OQLVerifyResponse> {
    // we fake group dimensions as being filters, to verify altogether
    const filtersOql =
      this.activeMode === TsFilteringMode.OQL
        ? this.oqlValue
        : FilterUtils.filtersToOQL(
            this.activeFilters.filter(FilterUtils.filterItemIsValid),
            TimeSeriesConfig.ATTRIBUTES_PREFIX,
          );
    let groupingItems: FilterBarItem[] = groupDimensions.map((dimension) => ({
      attributeName: dimension,
      type: FilterBarItemType.FREE_TEXT,
      freeTextValues: ['fake-group-dimension'],
      exactMatch: true,
      label: '',
      searchEntities: [],
    }));
    const groupingOql = FilterUtils.filtersToOQL(groupingItems, TimeSeriesConfig.ATTRIBUTES_PREFIX);
    const finalOql = `${groupingOql} and (${filtersOql})`;
    return this._timeSeriesService.verifyOql(finalOql);
  }

  handleGroupingChange(dimensions: string[]) {
    this.activeGrouping = dimensions;
    this.composeAndVerifyFullOql(dimensions).subscribe((response) => {
      this.rawMeasurementsModeActive = response.hasUnknownFields;
      // for grouping change, we will trigger refresh automatically. otherwise grouping and filters will change together
      if (!this.rawMeasurementsModeActive) {
        this.context.updateGrouping(dimensions);
      } else {
        // wait for the manual apply
      }
    });
  }

  emitFiltersChange() {
    const settings: TsFilteringSettings = {
      mode: this.activeMode,
      filterItems: this.getValidFilters(),
      oql: this.oqlValue,
    };
    this.context.setFilteringSettings(settings);
  }

  manuallyApplyFilters() {
    if (this.haveNewGrouping()) {
      this.context.updateGrouping(this.activeGrouping);
    }
    if (this.activeMode === TsFilteringMode.STANDARD) {
      this.emitFiltersChange();
    } else {
      // oql mode
      const oql = this.oqlValue;
      this._timeSeriesService.verifyOql(oql).subscribe((response) => {
        this.invalidOql = !response.valid;
        if (response.valid && response.hasUnknownFields) {
        }
        if (response.valid) {
          this.emitFiltersChange();
        } else {
          this.invalidOql = true;
        }
      });
    }
  }

  handleFilterChange(index: number, item: FilterBarItem) {
    this.activeFilters[index] = item;
    if (!item.attributeName) {
      this.removeFilterItem(index);
      return;
    }
    const existingItems = this.activeFilters.filter((i) => i.attributeName === item.attributeName);
    if (existingItems.length > 1) {
      // the filter is duplicated
      this._snackbar.open('Filter not applied', 'dismiss');
      this.removeFilterItem(index);
      return;
    }
    if (item.updateTimeSelectionOnFilterChange && item.searchEntities.length > 0) {
      // calculate the new time range. if all the entities were deleted, keep the last range.
      const newRange = this.getExecutionsTimeRange(item);
      this.activeTimeRange = { type: 'ABSOLUTE', absoluteSelection: newRange };
      this.timeRangeChange.next({ selection: this.activeTimeRange, triggerRefresh: false });
    }

    this.emitFilterChange$.next();
  }

  private getExecutionsTimeRange(item: FilterBarItem): TimeRange {
    let allExecutionsAreKnown = true;
    let min = Number.MAX_VALUE;
    let max = 0;
    item.searchEntities.forEach((entity) => {
      const execution = entity.entity as Execution;
      if (execution) {
        if (min > execution.startTime!) {
          min = execution.startTime!;
        }
        if (execution.endTime && max < execution.endTime) {
          max = execution.endTime;
        }
      } else {
        allExecutionsAreKnown = false;
      }
    });
    if (!allExecutionsAreKnown) {
      // don't reduce the interval because we have execution with no info
      let fullTimeRange = this.context.getFullTimeRange();
      min = Math.min(fullTimeRange.from!, min);
      max = Math.max(fullTimeRange.to!, max);
    }
    return { from: min, to: max };
  }

  addFilterItem(item: FilterBarItem) {
    const filterIndex = this.activeFilters.findIndex((i) => i.attributeName === item.attributeName);

    if (filterIndex !== -1) {
      const index =
        filterIndex < this.activeFilters.length - this.activeFilters.length
          ? filterIndex
          : filterIndex + this.activeFilters.length;

      this.filterComponents!.toArray()[index].menuTrigger!.openMenu();
    } else {
      this.addFilter(JSON.parse(JSON.stringify(item)));
    }
  }

  addCustomFilter(type: FilterBarItemType) {
    this.addFilter({
      attributeName: '',
      type: type,
      label: '',
      removable: true,
      searchEntities: [],
    });
  }

  removeFilterItem(index: number) {
    const itemToDelete = this.activeFilters[index];

    this.activeFilters.splice(index, 1);
    this.collectUnusedFilterOptions();
    if (FilterUtils.filterItemIsValid(itemToDelete)) {
      this.emitFilterChange$.next();
    }
  }

  private addFilter(item: FilterBarItem): void {
    this.activeFilters.push(item);
    this.collectUnusedFilterOptions();
    this._changeDetectorRef.detectChanges();
    this.filterComponents!.last.openMenu();
    this.filterComponents!.last.menuTrigger!.menuClosed.pipe(take(1)).subscribe(() => {
      if (!item.attributeName) {
        this.removeFilterItem(this.activeFilters.length - 1);
      }
    });
  }

  private haveNewGrouping() {
    const contextGrouping = this.context.getGroupDimensions();
    if (contextGrouping.length !== this.activeGrouping.length) {
      return true;
    } else {
      for (let i = 0; i < this.activeGrouping.length; i++) {
        if (this.activeGrouping[i] !== contextGrouping[i]) {
          return true;
        }
      }
    }
    return false;
  }

  openDiscovery() {
    const data: DiscoverDialogData = { oqlFilter: this.createRawMeasurementsFilter() };
    this._matDialog.open(DiscoverComponent, { data: data });
  }

  private createRawMeasurementsFilter() {
    const filteringSettings = this.context.getFilteringSettings();
    const filtersOql =
      filteringSettings.mode === TsFilteringMode.OQL
        ? filteringSettings.oql!.replace('attributes.', '')
        : FilterUtils.filtersToOQL(this.getValidFilters(), undefined, ATTRIBUTES_REMOVAL_FUNCTION);
    // const contextualOql = FilterUtils.objectToOQL(
    //   this.performanceViewSettings.contextualFilters,
    //   undefined,
    //   ATTRIBUTES_REMOVAL_FUNCTION
    // );
    const selectedTimeRange = this.context.getSelectedTimeRange();
    return new OQLBuilder()
      .open('and')
      .append(`(begin < ${Math.trunc(selectedTimeRange.to!)} and begin > ${Math.trunc(selectedTimeRange.from!)})`)
      .append(filtersOql)
      .build();
  }

  ngOnDestroy(): void {
    this.emitFilterChange$.complete();
  }
}
