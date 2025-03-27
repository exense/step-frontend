import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { debounceTime, Observable, Subject, take } from 'rxjs';
import { Execution, MetricAttribute, OQLVerifyResponse, Tab, TimeRange, TimeSeriesService } from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import {
  COMMON_IMPORTS,
  DiscoverComponent,
  DiscoverDialogData,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  OQLBuilder,
  TimeSeriesConfig,
  TimeSeriesContext,
  TsFilteringMode,
  TsFilteringSettings,
  TsGroupingComponent,
} from '../../../_common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PerformanceViewTimeSelectionComponent } from '../perfomance-view-time-selection/performance-view-time-selection.component';
import { FilterBarItemComponent } from '../filter-bar-item/filter-bar-item.component';
import { VisibleFilterBarItemPipe } from '../../pipes/visible-filter-item.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimeRangePickerComponent } from '../../../_common/components/time-range-picker/time-range-picker.component';
import { TimeRangePickerSelection } from '../../../_common/types/time-selection/time-range-picker-selection';

const ATTRIBUTES_REMOVAL_FUNCTION = (field: string) => {
  if (field.startsWith('attributes.')) {
    return field.replace('attributes.', '');
  } else {
    return field;
  }
};

@Component({
  selector: 'step-ts-dashboard-filter-bar',
  templateUrl: './dashboard-filter-bar.component.html',
  styleUrls: ['./dashboard-filter-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    DiscoverComponent,
    PerformanceViewTimeSelectionComponent,
    TimeRangePickerComponent,
    TsGroupingComponent,
    FilterBarItemComponent,
    VisibleFilterBarItemPipe,
  ],
})
export class DashboardFilterBarComponent implements OnInit, OnDestroy {
  @Input() context!: TimeSeriesContext;

  _internalFilters: FilterBarItem[] = [];
  @Input() compactView = false;
  @Input() timeRangeOptions!: TimeRangePickerSelection[];
  @Input() activeTimeRangeSelection!: TimeRangePickerSelection;
  @Input() editMode = false;

  @Output() timeRangeChange = new EventEmitter<{ selection: TimeRangePickerSelection; triggerRefresh: boolean }>();

  @ViewChild(PerformanceViewTimeSelectionComponent) timeSelection?: PerformanceViewTimeSelectionComponent;
  @ViewChildren(FilterBarItemComponent) filterComponents?: QueryList<FilterBarItemComponent>;
  @ViewChildren('appliedFilter', { read: ElementRef }) appliedFilters?: QueryList<ElementRef<HTMLElement>>;

  private _destroyRef = inject(DestroyRef);

  filterOptions: MetricAttribute[] = []; // dashboard attributes that are not used in filters yet

  activeGrouping: string[] = [];
  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;

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
    let contextFiltering = this.context.getFilteringSettings();
    this.oqlValue = contextFiltering.oql || '';
    this.activeMode = contextFiltering.mode;
    this._internalFilters = contextFiltering.filterItems;
    this.context
      .onAttributesChange()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((attributes: Record<string, MetricAttribute>) => {
        const customGroupingOptions: { label: string; attributes: string[] }[] = [];
        if (attributes[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE]) {
          customGroupingOptions.push({ label: 'Execution', attributes: [TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE] });
        }
        if (attributes[TimeSeriesConfig.PLAN_ID_ATTRIBUTE]) {
          customGroupingOptions.push({ label: 'Plan', attributes: [TimeSeriesConfig.PLAN_ID_ATTRIBUTE] });
        }
        if (attributes[TimeSeriesConfig.TASK_ID_ATTRIBUTE]) {
          customGroupingOptions.push({ label: 'Task', attributes: [TimeSeriesConfig.TASK_ID_ATTRIBUTE] });
        }
        this.groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS.concat(customGroupingOptions);
        this.filterOptions = this.collectUnusedAttributes();
      });

    this.emitFilterChange$
      .pipe(debounceTime(this.EMIT_DEBOUNCE_TIME), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.composeAndVerifyFullOql(this.activeGrouping).subscribe((response) => {
          this.rawMeasurementsModeActive = response.hasUnknownFields;
          if (!this.rawMeasurementsModeActive) {
            this.emitFiltersChange();
          }
        });
      });
  }

  public addUniqueFilterItems(items: FilterBarItem[]) {
    const existingFilterAttributes: Record<string, boolean> = {};
    this._internalFilters.forEach((item) => (existingFilterAttributes[item.attributeName] = true));
    this._internalFilters = this._internalFilters.concat(
      items.filter((item) => !existingFilterAttributes[item.attributeName]),
    );
  }

  private collectUnusedAttributes(): MetricAttribute[] {
    const hiddenFilters = this.context.getFilteringSettings().hiddenFilters || [];
    return this.context
      .getAllAttributes()
      .filter(
        (attr) =>
          !this._internalFilters.find((item) => attr.name === item.attributeName) &&
          !hiddenFilters.find((item) => attr.name === item.attributeName),
      );
  }

  getValidFilters(): FilterBarItem[] {
    return this._internalFilters.filter(FilterUtils.filterItemIsValid);
  }

  handleOqlChange(event: any) {
    this.invalidOql = false;
  }

  toggleOQLMode(mode: number) {
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

  disableOqlMode() {
    this.activeMode = TsFilteringMode.STANDARD;
  }

  composeAndVerifyFullOql(groupDimensions: string[]): Observable<OQLVerifyResponse> {
    // we fake group dimensions as being filters, to verify altogether
    const filtersOql =
      this.activeMode === TsFilteringMode.OQL
        ? this.oqlValue
        : FilterUtils.filtersToOQL(
            this._internalFilters.filter(FilterUtils.filterItemIsValid),
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
      filterItems: JSON.parse(JSON.stringify(this._internalFilters)),
      hiddenFilters: this.context.getFilteringSettings().hiddenFilters,
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
    this._internalFilters[index] = item;
    if (!item.attributeName) {
      this.removeFilterItem(index);
      return;
    }
    const existingItems = this._internalFilters.filter((filterItem) => filterItem.attributeName === item.attributeName);
    if (existingItems.length > 1) {
      // the filter is duplicated
      this._snackbar.open('Filter not applied', 'dismiss');
      this.removeFilterItem(index);
      return;
    }
    if (item.updateTimeSelectionOnFilterChange && item.searchEntities.length > 0) {
      // calculate the new time range. if all the entities were deleted, keep the last range.
      const newRange = this.getExecutionsTimeRange(item);
      this.activeTimeRangeSelection = { type: 'ABSOLUTE', absoluteSelection: newRange };
      this.timeRangeChange.next({ selection: this.activeTimeRangeSelection, triggerRefresh: true });
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
        console.error('Execution entities not found in the filters');
        allExecutionsAreKnown = false;
      }
    });
    if (!allExecutionsAreKnown) {
      // don't reduce the interval because we have execution with no info
      let fullTimeRange = this.context.getFullTimeRange();
      min = Math.min(fullTimeRange.from!, min);
      max = Math.max(fullTimeRange.to!, max);
    }
    if (!max) {
      max = new Date().getTime();
    }
    return { from: min, to: max };
  }

  addFilterItem(metricAttribute: MetricAttribute) {
    const filterIndex = this._internalFilters.findIndex(
      (filterItem) => filterItem.attributeName === metricAttribute.name,
    );
    if (filterIndex < 0) {
      this.addFilter(FilterUtils.createFilterItemFromAttribute(metricAttribute));
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
    const itemToDelete = this._internalFilters[index];

    this._internalFilters.splice(index, 1);
    this._internalFilters = [...this._internalFilters];
    this.filterOptions = this.collectUnusedAttributes();
    if (FilterUtils.filterItemIsValid(itemToDelete)) {
      this.emitFilterChange$.next();
    }
  }

  private addFilter(item: FilterBarItem): void {
    this._internalFilters = [...this._internalFilters, item];
    this.filterOptions = this.collectUnusedAttributes();
    this._changeDetectorRef.detectChanges();
    this.filterComponents!.last.openMenu();
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
