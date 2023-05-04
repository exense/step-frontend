import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
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
import { TimeSeriesContext } from '../../time-series-context';
import { FilterUtils } from '../../util/filter-utils';
import { PerformanceViewSettings } from '../model/performance-view-settings';
import { PerformanceViewTimeSelectionComponent } from '../time-selection/performance-view-time-selection.component';
import { FilterBarItemComponent } from './item/filter-bar-item.component';
import { FilterBarItemType, TsFilterItem } from './model/ts-filter-item';
import { TsFilteringSettings } from '../../model/ts-filtering-settings';
import { TimeSeriesConfig } from '../../time-series.config';
import { TableApiWrapperService, TimeSeriesService } from '@exense/step-core';
import { OqlVerifyResponse } from '../../model/oql-verify-response';
import { TsFilteringMode } from '../../model/ts-filtering-mode';
import { OQLBuilder } from '../../util/oql-builder';

const ATTRIBUTES_REMOVAL_FUNCTION = (field: string) => {
  if (field.startsWith('attributes.')) {
    return field.replace('attributes.', '');
  } else {
    return field;
  }
};

@Component({
  selector: 'step-ts-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() context!: TimeSeriesContext;
  @Input() performanceViewSettings!: PerformanceViewSettings;
  @Input() defaultFilterOptions: TsFilterItem[] = [];
  @Input() hiddenFilters: TsFilterItem[] = [];

  @Output() onFiltersChange = new EventEmitter<TsFilterItem[]>();
  @Output() onFilterSettingsChange = new EventEmitter<TsFilteringSettings>();
  @Output() onGroupingChange = new EventEmitter<string[]>();

  @ViewChild(PerformanceViewTimeSelectionComponent) timeSelection?: PerformanceViewTimeSelectionComponent;

  @ViewChildren(FilterBarItemComponent) filterComponents?: QueryList<FilterBarItemComponent>;
  @ViewChildren('appliedFilter', { read: ElementRef }) appliedFilters?: QueryList<ElementRef<HTMLElement>>;

  private emitFilterChange$ = new Subject<void>();

  readonly EMIT_DEBOUNCE_TIME = 300;
  readonly FilterBarItemType = FilterBarItemType;
  exportInProgress = false;

  visibleFilters: TsFilterItem[] = [];
  groupDimensions: string[] = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS[0].attributes;

  rawMeasurementsModeActive = false;

  oqlModeActive = false;
  oqlValue: string = '';
  invalidOql = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private timeSeriesService: TimeSeriesService,
    private tableApiService: TableApiWrapperService
  ) {}

  getFilters(): TsFilterItem[] {
    return this.visibleFilters;
  }

  getValidFilters(): TsFilterItem[] {
    return this.getFilters().filter(FilterUtils.filterItemIsValid);
  }

  prepareVisibleFilters() {
    const predefinedFiltersById = new Map<string, TsFilterItem>();
    this.hiddenFilters?.forEach((item) => {
      predefinedFiltersById.set(item.attributeName, item);
    });
    const combinedFilters = this.defaultFilterOptions.map((option) => {
      return predefinedFiltersById.get(option.attributeName) || option;
    });

    this.visibleFilters = combinedFilters;
  }

  ngOnInit(): void {
    if (!this.context) {
      throw new Error('Context input is mandatory');
    }
    this.prepareVisibleFilters();
    this.emitFilterChange$.pipe(debounceTime(this.EMIT_DEBOUNCE_TIME)).subscribe(() => {
      this.composeAndVerifyFullOql(this.groupDimensions).subscribe((response) => {
        this.rawMeasurementsModeActive = response.hasUnknownFields;
        if (!this.rawMeasurementsModeActive) {
          this.emitFiltersChange();
        }
      });
    });
  }

  handleOqlChange(event: any) {
    this.invalidOql = false;
  }

  toggleOQLMode() {
    if (this.oqlModeActive) {
      const contextualOql = FilterUtils.objectToOQL(this.performanceViewSettings.contextualFilters);
      const customOql = FilterUtils.filtersToOQL(this.getValidFilters(), TimeSeriesConfig.ATTRIBUTES_PREFIX);
      this.oqlValue = customOql;
    } else {
      this.invalidOql = false;
    }
  }

  disableOqlMode() {
    this.oqlModeActive = false;
  }

  composeAndVerifyFullOql(groupDimensions: string[]): Observable<OqlVerifyResponse> {
    // we fake group dimensions as being filters, to verify altogether
    const filtersOql = this.oqlModeActive
      ? this.oqlValue
      : FilterUtils.filtersToOQL(
          this.visibleFilters.filter(FilterUtils.filterItemIsValid),
          TimeSeriesConfig.ATTRIBUTES_PREFIX
        );
    let groupingItems: TsFilterItem[] = groupDimensions.map((dimension) => ({
      attributeName: dimension,
      type: FilterBarItemType.FREE_TEXT,
      textValue: 'group-dimension',
      label: '',
    }));
    const groupingOql = FilterUtils.filtersToOQL(groupingItems, TimeSeriesConfig.ATTRIBUTES_PREFIX) || '';
    const finalOql: string = filtersOql ? `(${groupingOql}) and ${filtersOql}` : groupingOql;
    return this.timeSeriesService.verifyOql(finalOql);
  }

  handleGroupingChange(dimensions: string[]) {
    this.groupDimensions = dimensions;
    this.composeAndVerifyFullOql(dimensions).subscribe((response) => {
      this.rawMeasurementsModeActive = response.hasUnknownFields;
      // for grouping change, we will trigger refresh automatically. otherwise grouping and filters will change together
      if (!this.rawMeasurementsModeActive) {
        this.onGroupingChange.emit(dimensions);
      } else {
        // wait for the manual apply
      }
    });
  }

  emitFiltersChange() {
    const settings: TsFilteringSettings = {
      mode: this.oqlModeActive ? TsFilteringMode.OQL : TsFilteringMode.STANDARD,
      baseFilters: this.context.getBaseFilters(),
      filterItems: this.getFilters().filter(FilterUtils.filterItemIsValid),
      oql: this.oqlValue,
    };
    this.onFilterSettingsChange.emit(settings);
  }

  manuallyApplyFilters() {
    if (this.haveNewGrouping()) {
      this.onGroupingChange.emit(this.groupDimensions);
    }
    if (!this.oqlModeActive) {
      this.emitFiltersChange();
    } else {
      // oql mode
      let oql = this.oqlValue;
      this.timeSeriesService.verifyOql(oql).subscribe((response) => {
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

  ngOnDestroy(): void {
    this.emitFilterChange$.complete();
    this.onFiltersChange.complete();
  }

  handleFilterChange(index: number, item: TsFilterItem) {
    this.visibleFilters[index] = item;
    this.emitFilterChange$.next();
  }

  addFilterItem(item: TsFilterItem) {
    const filterIndex = this.visibleFilters.findIndex((i) => i.attributeName === item.attributeName);

    if (filterIndex !== -1) {
      const index =
        filterIndex < this.visibleFilters.length - this.visibleFilters.length
          ? filterIndex
          : filterIndex + this.visibleFilters.length;

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
    });
  }

  removeFilterItem(index: number) {
    let itemToDelete = this.visibleFilters[index];

    this.visibleFilters.splice(index, 1);

    if (FilterUtils.filterItemIsValid(itemToDelete)) {
      this.emitFilterChange$.next();
    }
  }

  private addFilter(item: TsFilterItem): void {
    this.visibleFilters.push(item);
    this._changeDetectorRef.detectChanges();
    this.filterComponents!.last.openMenu();
    this.filterComponents!.last.menuTrigger!.menuClosed.pipe(take(1)).subscribe(() => {
      if (!this.filterComponents!.last.changesApplied) {
        this.visibleFilters.pop();
      }
    });
  }

  private haveNewGrouping() {
    let contextGrouping = this.context.getGroupDimensions();
    if (contextGrouping.length !== this.groupDimensions.length) {
      return true;
    } else {
      for (let i = 0; i < this.groupDimensions.length; i++) {
        if (this.groupDimensions[i] !== contextGrouping[i]) {
          return true;
        }
      }
    }
    return false;
  }

  exportRawData() {
    if (this.exportInProgress) {
      return;
    }
    let filteringSettings = this.context.getFilteringSettings();
    let filtersOql =
      filteringSettings.mode === TsFilteringMode.OQL
        ? filteringSettings.oql.replace('attributes.', '')
        : FilterUtils.filtersToOQL(this.getValidFilters(), undefined, ATTRIBUTES_REMOVAL_FUNCTION);
    let contextualOql = FilterUtils.objectToOQL(
      this.performanceViewSettings.contextualFilters,
      undefined,
      ATTRIBUTES_REMOVAL_FUNCTION
    );
    let selectedTimeRange = this.context.getSelectedTimeRange();
    let oql = new OQLBuilder()
      .open('and')
      .append(`(begin < ${Math.trunc(selectedTimeRange.to)} and begin > ${Math.trunc(selectedTimeRange.from)})`)
      .append(filtersOql)
      .append(contextualOql)
      .build();
    this.exportInProgress = true;
    this.timeSeriesService.getMeasurementsAttributes(oql).subscribe((fields) => {
      this.tableApiService
        .exportAsCSV('measurements', fields, { filters: [{ oql: oql }] })
        .subscribe(() => (this.exportInProgress = false));
    });
  }
}
